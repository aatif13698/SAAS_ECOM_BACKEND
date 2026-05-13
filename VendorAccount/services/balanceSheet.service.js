// services/report/BalanceSheetService.js
const mongoose = require('mongoose');
const { getClientDatabaseConnection } = require('../../db/connection');
// const { getClientDatabaseConnection } = require('../db/connection'); // your existing helper

class BalanceSheetService {
    constructor(clientId) {
        this.clientConnection = null;
        this.LedgerGroup = null;
        this.Ledger = null;
        this.clientId = clientId;
    }

    async _init() {
        if (!this.clientConnection) {
            this.clientConnection = await getClientDatabaseConnection(this.clientId);
            this.LedgerGroup = this.clientConnection.model('ledgerGroup', require('../../client/model/ledgerGroup'));
            this.Ledger = this.clientConnection.model('ledger', require('../../client/model/ledger'));
        }
    }

    /**
     * Main method - Generate full Balance Sheet
     * @param {Object} filters
     * @param {Date} asOfDate - defaults to now
     */
    async generateBalanceSheet({
        businessId,
        branchId = null,
        warehouseId = null,
        asOfDate = new Date(),
        level = 'business' // 'business' | 'branch' | 'warehouse'
    }) {
        await this._init();

        let baseFilter = {
            isActive: true,
        };

        if (level == "vendor") {

        } else if (level == "business" && businessId) {
            baseFilter = {
                ...baseFilter,
                isBuLevel: true,
                businessUnit: businessId
            }
        } else if (level == "branch" && branchId) {
            baseFilter = {
                ...baseFilter,
                isBranchLevel: true,
                branch: branchId
            }
        } else if (level == "warehouse" && warehouseId) {
            baseFilter = {
                ...baseFilter,
                isWarehouseLevel: true,
                warehouse: warehouseId
            }
        }

        // const baseFilter = {
        //     isActive: true,
        //     ...(businessId && { businessUnit: new mongoose.Types.ObjectId(businessId) }),
        //     ...(branchId && level !== 'business' && { branch: new mongoose.Types.ObjectId(branchId) }),
        //     ...(warehouseId && level === 'warehouse' && { warehouse: new mongoose.Types.ObjectId(warehouseId) }),
        // };

        console.log("baseFilter", baseFilter);


        // 1. Fetch ALL groups + ledgers in one go (very efficient)
        const [groups, ledgers] = await Promise.all([
            this.LedgerGroup.find(baseFilter).lean(),
            this.Ledger.find(baseFilter).lean()
        ]);

        // 2. Build fast lookup maps
        const groupMap = new Map();
        const childrenMap = new Map();

        groups.forEach(g => {
            const idStr = g._id.toString();
            groupMap.set(idStr, {
                ...g,
                children: [],
                ledgers: [],
                total: 0,
                // future: normalBalance: g.normalBalance || 'debit'
            });
            childrenMap.set(idStr, []);
        });

       


        // Link children
        groups.forEach(g => {
            if (g.parentGroup) {
                const parentId = g.parentGroup.toString();
                if (childrenMap.has(parentId)) {
                    childrenMap.get(parentId).push(g._id.toString());
                }
            }
        });

         console.log("groupMap", groupMap);
        console.log("childrenMap", childrenMap);

        // Attach ledgers to their immediate group + add balance
        ledgers.forEach(ledger => {
            const gid = ledger.ledgerGroupId?.toString();
            if (gid && groupMap.has(gid)) {
                const group = groupMap.get(gid);
                group.ledgers.push(ledger);

                // Sign convention (real-world standard)
                let balance = ledger.balance || 0;
                if (ledger.isCredit) balance = -balance; // credit balance is positive for liability/equity
                group.total += balance;
            }
        });

        // 3. Recursive bottom-up total calculation (core of all ERP reports)
        const computeSubtreeTotal = (groupId) => {
            const group = groupMap.get(groupId);
            if (!group) return 0;

            let total = group.total; // own ledgers

            const childIds = childrenMap.get(groupId) || [];
            for (const childId of childIds) {
                total += computeSubtreeTotal(childId);
            }

            group.total = total;
            return total;
        };

        // 4. Find root groups (exactly as created in your generateLedgerGroup)
        const rootGroups = groups.filter(g => !g.parentGroup || g.hasParent === false);
        rootGroups.forEach(root => computeSubtreeTotal(root._id.toString()));

        // 5. Extract the two sides of Balance Sheet
        const assetsRoot = rootGroups.find(r => r.groupName === 'Assets');
        const liabilitiesRoot = rootGroups.find(r => r.groupName === 'Liabilities');
        const capitalRoot = rootGroups.find(r => r.groupName === 'Capital Account');

        // 6. Build clean nested tree for frontend
        const buildTree = (groupId) => {
            const group = groupMap.get(groupId);
            if (!group) return null;

            const childIds = childrenMap.get(groupId) || [];
            const children = childIds
                .map(id => buildTree(id))
                .filter(Boolean);

            return {
                groupId: group._id,
                groupName: group.groupName,
                isPrimary: group.isPrimary || false,
                total: Number(group.total.toFixed(2)),
                ledgers: group.ledgers.map(l => ({
                    ledgerId: l._id,
                    ledgerName: l.ledgerName,
                    alias: l.alias,
                    balance: Number((l.isCredit ? -l.balance : l.balance).toFixed(2)),
                    ledgerType: l.ledgerType,
                })),
                children,
            };
        };

        const assetsTree = assetsRoot ? buildTree(assetsRoot._id.toString()) : null;
        const liabilitiesTree = liabilitiesRoot ? buildTree(liabilitiesRoot._id.toString()) : null;
        const capitalTree = capitalRoot ? buildTree(capitalRoot._id.toString()) : null;

        const totalAssets = assetsTree ? assetsTree.total : 0;
        const totalLiabilities = liabilitiesTree ? liabilitiesTree.total : 0;
        const totalEquity = capitalTree ? capitalTree.total : 0;
        const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

        const balanceSheet = {
            asOf: asOfDate,
            level,
            businessId,
            branchId,
            warehouseId,
            assets: assetsTree || { groupName: 'Assets', total: 0, children: [], ledgers: [] },
            liabilitiesAndEquity: {
                liabilities: liabilitiesTree || { groupName: 'Liabilities', total: 0, children: [], ledgers: [] },
                equity: capitalTree || { groupName: 'Capital Account', total: 0, children: [], ledgers: [] },
            },
            totals: {
                totalAssets: Number(totalAssets.toFixed(2)),
                totalLiabilitiesAndEquity: Number(totalLiabilitiesAndEquity.toFixed(2)),
                difference: Number((totalAssets - totalLiabilitiesAndEquity).toFixed(2)), // should be ~0
            },
            // Future: netProfitLoss (calculate from Income/Expense groups)
        };

        // Optional: Log imbalance for debugging (production monitoring)
        if (Math.abs(balanceSheet.totals.difference) > 0.01) {
            console.warn('⚠️ Balance Sheet imbalance detected:', balanceSheet.totals.difference);
        }

        return balanceSheet;
    }
}

module.exports = BalanceSheetService;