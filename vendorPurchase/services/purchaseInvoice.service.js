// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const ledgerSchema = require("../../client/model/ledger");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const voucherSchema = require("../../client/model/voucher");
const { v4: uuidv4 } = require('uuid');
const productMainStockSchema = require("../../client/model/productMainStock");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const stockLedgerSchema = require("../../client/model/stockLedger");
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");



// const create = async (clientId, data, mainUser) => {
//     const clientConnection = await getClientDatabaseConnection(clientId);

//     const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
//     const Ledger = clientConnection.model("ledger", ledgerSchema);
//     const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
//     const Voucher = clientConnection.model("voucher", voucherSchema);
//     const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

//     const session = await clientConnection.startSession();

//     try {
//         const result = await session.withTransaction(async (session) => {
//             let pi;



//             // ── Payment part ───────────────────────────────────────
//             if (data?.paidAmount > 0) {

//                 const supplierLedger = await Ledger.findById(data.supplierLedger).session(session);
//                 if (!supplierLedger) throw new CustomError(400, 'Supplier ledger not found.');

//                 const payedFromLedger = await Ledger.findById(data?.payedFrom).session(session);
//                 if (!payedFromLedger) throw new CustomError(400, 'Payment ledger not found.');

//                 if (payedFromLedger.balance < data.paidAmount) {
//                     await session.abortTransaction();
//                     throw new CustomError(400, 'Insufficient Amount in payment ledger.');
//                 }

//                 const voucherGroup = await VoucherGroup.findOne({
//                     warehouse: data?.warehouse,
//                     isWarehouseLevel: true,
//                     name: "Payment"
//                 }).session(session);

//                 if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

//                 const voucherLinkId = uuidv4();

//                 const voucherDocs = [
//                     {
//                         businessUnit: data?.businessUnit,
//                         branch: data?.branch,
//                         warehouse: data?.warehouse,
//                         isWarehouseLevel: true,
//                         voucherGroup: voucherGroup._id,
//                         narration: "Purchase invoice payment.",
//                         voucherLinkId,
//                         ledger: data.supplierLedger,
//                         debit: 0,
//                         credit: data.paidAmount,
//                         isSingleEntry: false,
//                         createdBy: mainUser._id,
//                     },
//                     {
//                         businessUnit: data?.businessUnit,
//                         branch: data?.branch,
//                         warehouse: data?.warehouse,
//                         isWarehouseLevel: true,
//                         voucherGroup: voucherGroup._id,
//                         narration: "Purchase invoice payment.",
//                         voucherLinkId,
//                         ledger: data.payedFrom,
//                         debit: data.paidAmount,
//                         credit: 0,
//                         isSingleEntry: false,
//                         createdBy: mainUser._id,
//                     }
//                 ];

//                 // Important: ordered: true when using session + multiple docs
//                 await Voucher.create(voucherDocs, { session, ordered: true });

//                 // Update ledgers

//                 payedFromLedger.balance -= Number(data.paidAmount);
//                 await payedFromLedger.save({ session });

//                 if (Number(data.balance) > 0) {
//                     supplierLedger.balance -= Number(data.balance);
//                 }

//                 await supplierLedger.save({ session });

//                 // ── Duplicate check ────────────────────────────────────
//                 const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber })
//                     .session(session)
//                     .lean();

//                 if (existingPi) {
//                     throw new CustomError(400, 'Purchase invoice number already exists.');
//                 }

//                 console.log("Number(payedFromLedger.balance)", Number(payedFromLedger.balance));

//                 // ── Create Purchase Invoice ────────────────────────────
//                 [pi] = await PurchaseInvoice.create([{ ...data, payedFrom: [{ id: data.payedFrom, paymentType: "Payment", amount: Number(data.paidAmount) }], status: Number(data.balance) == 0 ? "paid" : "partially_paid" }], {
//                     session,
//                     ordered: true   // safe even for 1 document
//                 });

//                 if (pi) {
//                     await SerialNumber.findOneAndUpdate({ collectionName: "purchase_invoice" }, { $inc: { nextNum: 1 } })
//                 }

//                 return pi;

//             } else {

//                 console.log("data", data);

//                 const supplierLedger = await Ledger.findById(data.supplierLedger).session(session);


//                 if (Number(data.balance) > 0) {
//                     supplierLedger.balance -= Number(data.balance);
//                 }

//                 await supplierLedger.save({ session });

//                 // ── Duplicate check ────────────────────────────────────
//                 const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber })
//                     .session(session)
//                     .lean();
//                 if (existingPi) {
//                     throw new CustomError(400, 'Purchase invoice number already exists.');
//                 }
//                 // ── Create Purchase Invoice ────────────────────────────
//                 [pi] = await PurchaseInvoice.create([{ ...data, payedFrom: [], paymentMethod: "", status: "full_due" }], {
//                     session,
//                     ordered: true   // safe even for 1 document
//                 });

//                 if (pi) {
//                     await SerialNumber.findOneAndUpdate({ collectionName: "purchase_invoice" }, { $inc: { nextNum: 1 } })
//                 }

//                 return pi;
//             }
//         });

//         return result;
//     } catch (error) {
//         throw new CustomError(
//             error.statusCode || 500,
//             `Error creating purchase invoice: ${error.message}`
//         );
//     } finally {
//         session.endSession();
//     }
// };


const create = async (clientId, data, mainUser) => {
    const clientConnection = await getClientDatabaseConnection(clientId);

    const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
    const Ledger = clientConnection.model("ledger", ledgerSchema);
    const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
    const Voucher = clientConnection.model("voucher", voucherSchema);
    const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

    const session = await clientConnection.startSession();

    try {
        return await session.withTransaction(async () => {
            // ── 1. Basic input sanitization (real-world safeguard) ──
            const paidAmount = Number(data.paidAmount || 0);
            const balanceAmount = Number(data.balance || 0);

            if (paidAmount < 0 || balanceAmount < 0) {
                throw new CustomError(400, 'Amounts cannot be negative.');
            }

            // ── 2. EARLY Duplicate check (critical fix) ─────────────────────
            // This runs before ANY ledger/voucher changes → no wasted work on rollback
            const existingPi = await PurchaseInvoice.findOne({
                piNumber: data.piNumber
            }).session(session).lean();

            if (existingPi) {
                throw new CustomError(400, 'Purchase invoice number already exists.');
            }

            // ── 3. Fetch supplier ledger once (used in both paths) ───────────
            const supplierLedger = await Ledger.findById(data.supplierLedger).session(session);
            if (!supplierLedger) throw new CustomError(400, 'Supplier ledger not found.');

            let status = "full_due";
            let payedFromArray = [];

            // ── 4. Payment handling (vouchers + payment ledger) ─────────────
            if (paidAmount > 0) {
                const paymentLedger = await Ledger.findById(data.payedFrom).session(session);
                if (!paymentLedger) throw new CustomError(400, 'Payment ledger not found.');

                if (Number(paymentLedger.balance) < paidAmount) {
                    throw new CustomError(400, 'Insufficient Amount in payment ledger.');
                }

                const voucherGroup = await VoucherGroup.findOne({
                    warehouse: data?.warehouse,
                    isWarehouseLevel: true,
                    name: "Payment"
                }).session(session);

                if (!voucherGroup) throw new CustomError(400, 'Voucher group not found.');

                const voucherLinkId = uuidv4();

                await Voucher.insertMany([
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Purchase invoice payment.",
                        voucherLinkId,
                        ledger: data.supplierLedger,
                        debit: 0,
                        credit: paidAmount,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    },
                    {
                        businessUnit: data?.businessUnit,
                        branch: data?.branch,
                        warehouse: data?.warehouse,
                        isWarehouseLevel: true,
                        voucherGroup: voucherGroup._id,
                        narration: "Purchase invoice payment.",
                        voucherLinkId,
                        ledger: data.payedFrom,
                        debit: paidAmount,
                        credit: 0,
                        isSingleEntry: false,
                        createdBy: mainUser._id,
                    }
                ], { session, ordered: true });

                // Update payment source ledger
                paymentLedger.balance = Number(paymentLedger.balance) - paidAmount;
                await paymentLedger.save({ session });

                // Set paid status & reference
                status = balanceAmount === 0 ? "paid" : "partially_paid";
                payedFromArray = [{
                    id: data.payedFrom,
                    paymentType: "Payment",
                    amount: paidAmount
                }];
            }

            // ── 5. Update supplier ledger (common logic – outstanding balance) ──
            // This matches your original business rule exactly:
            //   • Paid path   → voucher already credited paidAmount + manual remaining
            //   • No-paid path → manual full amount
            if (balanceAmount > 0) {
                supplierLedger.balance -= balanceAmount;
                await supplierLedger.save({ session });
            }

            // ── 6. Create Purchase Invoice ───────────────────────────────────
            const invoicePayload = {
                ...data,
                payedFrom: payedFromArray,
                status,
                paymentMethod: paidAmount > 0 ? (data.paymentMethod || "") : ""
            };

            const [createdPi] = await PurchaseInvoice.create([invoicePayload], {
                session,
                ordered: true
            });

            // ── 7. Increment serial number (only on success) ─────────────────
            await SerialNumber.findOneAndUpdate(
                { collectionName: "purchase_invoice" },
                { $inc: { nextNum: 1 } },
                { session }
            );

            return createdPi;
        });
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error creating purchase invoice: ${error.message}`
        );
    } finally {
        await session.endSession();
    }
};





const getAuditPurchaseInvoice = async (clientId, purchaseInvoiceId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);

        const purchaseInvoice = await PurchaseInvoice.findOne({
            _id: purchaseInvoiceId,
            // auditStatus: "pending"
        }).lean();

        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }

        if (purchaseInvoice.items.length === 0) {
            throw new CustomError(statusCode.BadRequest, "No item found in invoice");
        }

        // Get all main stock documents in one query
        const mainStockIds = purchaseInvoice.items.map(item => item.itemName.productMainStock);
        const itemStocks = await MainStock.find({ _id: { $in: mainStockIds } })
            .select('totalStock')
            .lean();

        // Create lookup map for fast access (key: string id)
        const stockMap = new Map(
            itemStocks.map(stock => [stock._id.toString(), stock.totalStock])
        );
        console.log("stockMap", stockMap);
        // Add oldItemStock to each item
        const enrichedItems = purchaseInvoice.items.map(item => {
            const mainStockIdStr = item.itemName.productMainStock.toString();
            const oldItemStock = stockMap.get(mainStockIdStr) || 0;
            return {
                ...item,
                oldItemStock
            };
        });
        // Create the final enriched invoice object
        const result = {
            ...purchaseInvoice,
            items: enrichedItems
        };
        return result;
    } catch (error) {
        throw new CustomError(
            error.statusCode || 500,
            `Error getting audit purchase invoice: ${error.message}`
        );
    }
};


// const auditItem = async (clientId, purchaseInvoiceId, productMainStock) => {
//     try {
//         const clientConnection = await getClientDatabaseConnection(clientId);
//         const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
//         const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
//         const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId).lean();
//         if (!purchaseInvoice) {
//             throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
//         }
//         const item = MainStock.findById(productMainStock).lean();
//         if (!item) {
//             throw new CustomError(statusCode.NotFound, "Stock not found.");
//         }
//         const filteredItem = purchaseInvoice.items.find((item) => item.itemName.productMainStock == productMainStock)
//         item.totalStock += Number(filteredItem.quantity);
//         await item.save();
//         const enrichedItems = purchaseInvoice.items.map(item => {
//             const mainStockIdStr = item.itemName.productMainStock.toString();
//             if (mainStockIdStr == productMainStock) {
//                 return {
//                     ...item,
//                     audited: true
//                 }
//             } else {
//                 return {
//                     ...item,
//                 };
//             }
//         });
//         purchaseInvoice.items = enrichedItems;
//         await purchaseInvoice.save();
//         return purchaseInvoice;
//     } catch (error) {
//         throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
//     }
// };

const auditItem = async (clientId, purchaseInvoiceId, productMainStock, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);

        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const StockLedger = clientConnection.model('stockLedger', stockLedgerSchema)

        // 1. Fetch purchase invoice
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }

        // 2. Find the matching stock document (use await!)
        const stockItem = await MainStock.findById(productMainStock);
        if (!stockItem) {
            throw new CustomError(statusCode.NotFound, "Stock item not found");
        }

        // 3. Find the corresponding item in invoice
        const invoiceItem = purchaseInvoice.items.find(
            (item) => item.itemName.productMainStock.toString() === productMainStock.toString()
        );

        if (!invoiceItem) {
            throw new CustomError(statusCode.BadRequest, "Item not found in this purchase invoice");
        }

        // // 4. Update main stock (assuming quantity is positive - incoming stock)
        stockItem.totalStock += Number(invoiceItem.quantity);
        await stockItem.save();

        console.log("stockItem", stockItem);

        // 1. Find the MOST RECENT previous ledger entry for this exact stock context

        const mainItem = purchaseInvoice.items.find((item) => {
            const mainStockIdStr = item.itemName.productMainStock.toString();
            if (mainStockIdStr === productMainStock.toString()) {
                return item
            }
        });

        const lastLedger = await StockLedger.findOne({
            businessUnit: purchaseInvoice.businessUnit,
            branch: purchaseInvoice.branch,
            warehouse: purchaseInvoice.warehouse,
            isVendorLevel: purchaseInvoice.isVendorLevel,
            isBuLevel: purchaseInvoice.isBuLevel,
            isBranchLevel: purchaseInvoice.isBranchLevel,
            isWarehouseLevel: purchaseInvoice.isWarehouseLevel,
        })
            .sort({ date: -1, createdAt: -1 })   // most recent first
            .select('totalStock')
            .lean();

        const previousBalance = lastLedger ? lastLedger.totalStock : 0;

        // 2. Calculate new balance
        let quantityChange = mainItem.quantity - 0;
        const newTotalStock = previousBalance + quantityChange;

        if (newTotalStock < 0) {
            throw new Error("Stock cannot go negative");
        }

        // 3. Create the new ledger entry with computed totalStock
        const newEntry = new StockLedger({
            businessUnit: purchaseInvoice.businessUnit,
            branch: purchaseInvoice.branch,
            warehouse: purchaseInvoice.warehouse,
            isVendorLevel: purchaseInvoice.isVendorLevel,
            isBuLevel: purchaseInvoice.isBuLevel,
            isBranchLevel: purchaseInvoice.isBranchLevel,
            isWarehouseLevel: purchaseInvoice.isWarehouseLevel,

            productMainStock: productMainStock,
            pricePerUnit: Number(mainItem.totalAmount / mainItem.quantity).toFixed(2),
            in: mainItem.quantity,
            purchaseInvoiceId: purchaseInvoice._id,
            totalStock: newTotalStock,
            date: purchaseInvoice.piDate || new Date(),
            type: "purchase",

            createdBy: mainUser._id

        });

        await newEntry.save();


        // 5. Mark item as audited & prepare to check if all are done
        let allAudited = true;

        const enrichedItems = purchaseInvoice.items.map((item) => {
            const mainStockIdStr = item.itemName.productMainStock.toString();

            if (mainStockIdStr === productMainStock.toString()) {
                return {
                    ...item.toObject(),           // safer with subdocuments
                    audited: true
                };
            }

            // While we're here — check if every item is audited
            if (!item.audited) {
                allAudited = false;
            }

            return item;
        });

        // 6. Update items array
        purchaseInvoice.items = enrichedItems;

        // 7. Auto-update auditStatus when all items are audited
        if (allAudited) {
            purchaseInvoice.auditStatus = 'completed';
        }

        // 8. Save invoice with updated items + possible status change
        await purchaseInvoice.save();

        console.log("purchaseInvoice", purchaseInvoice);


        return purchaseInvoice;

    } catch (error) {
        console.error(error);
        throw new CustomError(
            error.statusCode || statusCode.InternalServerError,
            `Audit failed: ${error.message}`
        );
    }
};


const update = async (clientId, purchaseInvoiceId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        Object.assign(purchaseInvoice, updateData);
        await purchaseInvoice.save();
        return purchaseInvoice
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, purchaseInvoiceId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId)
            .populate({
                path: "supplier",
                model: Supplier,
                select: "-items"
            });
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        return purchaseInvoice;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [purchaseInvoices, total] = await Promise.all([
            PurchaseInvoice.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                })
                .populate({
                    path: "businessUnit",
                    model: BusinessUnit,
                    select: "name"
                })
                .populate({
                    path: "branch",
                    model: Branch,
                    select: "name"
                })
                .populate({
                    path: "warehouse",
                    model: Warehouse,
                    select: "name"
                }),
            PurchaseInvoice.countDocuments(filters),
        ]);
        return { count: total, purchaseInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const allBySupplier = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const queryFilters = {
            ...filters,
            isReturnCreated: { $ne: true }   // not equal to true (covers false, null, undefined)
        };
        const [purchaseInvoices] = await Promise.all([
            PurchaseInvoice.find(queryFilters)
                .sort({ createdAt: -1 }),  // Sort by creation date descending (latest first)
        ]);
        return { purchaseInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const unpaid = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

        const query = {
            ...filters,
            balance: { $gt: 0 }
        };

        const [purchaseInvoices, total] = await Promise.all([
            PurchaseInvoice.find(query)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                }),
            PurchaseInvoice.countDocuments(query),
        ]);
        return { count: total, purchaseInvoices };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, purchaseInvoiceId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }
        Object.assign(purchaseInvoice, data);
        return await purchaseInvoice.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error in changing status: ${error.message}`);
    }
};


module.exports = {
    create,
    getAuditPurchaseInvoice,
    auditItem,

    update,
    getById,
    list,
    allBySupplier,
    changeStatus,
    unpaid
}; 