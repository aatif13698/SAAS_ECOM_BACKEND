

// helpers/auditItem.js
const { getClientDatabaseConnection } = require('../db/connection'); // your existing DB helper
const CustomError = require("../utils/customeError");
const statusCode = require('../utils/http-status-code');
const message = require('../utils/message');
const purchaseInvoiceSchema = require('../client/model/purchaseInvoice');
const productMainStockSchema = require('../client/model/productMainStock');
const stockLedgerSchema = require('../client/model/stockLedger');

const auditItem = async (clientId, purchaseInvoiceId, productMainStock, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);

        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const MainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const StockLedger = clientConnection.model('stockLedger', stockLedgerSchema);

        // 1. Fetch purchase invoice
        const purchaseInvoice = await PurchaseInvoice.findById(purchaseInvoiceId);
        if (!purchaseInvoice) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseInvoiceNotFound);
        }

        // 2. Find the item in the invoice (early return if already audited → idempotent)
        const invoiceItem = purchaseInvoice.items.find(
            (item) => item.itemName.productMainStock.toString() === productMainStock.toString()
        );

        if (!invoiceItem) {
            throw new CustomError(statusCode.BadRequest, "Item not found in this purchase invoice");
        }

        if (invoiceItem.audited === true) {
            console.log(`⚠️  Item ${productMainStock} already audited for invoice ${purchaseInvoiceId} - skipping`);
            return purchaseInvoice; // safe to call again after restart
        }

        // 3. Update main stock (current snapshot)
        const stockItem = await MainStock.findById(productMainStock);
        if (!stockItem) {
            throw new CustomError(statusCode.NotFound, "Stock item not found");
        }

        stockItem.totalStock += Number(invoiceItem.quantity);
        await stockItem.save();

        // 4. Get the MOST RECENT ledger entry for this EXACT stock context (FIXED)
        const lastLedger = await StockLedger.findOne({
            productMainStock: productMainStock,           // ← IMPORTANT FIX
            businessUnit: purchaseInvoice.businessUnit,
            branch: purchaseInvoice.branch,
            warehouse: purchaseInvoice.warehouse,
            isVendorLevel: purchaseInvoice.isVendorLevel,
            isBuLevel: purchaseInvoice.isBuLevel,
            isBranchLevel: purchaseInvoice.isBranchLevel,
            isWarehouseLevel: purchaseInvoice.isWarehouseLevel,
        })
            .sort({ date: -1, createdAt: -1 })
            .select('totalStock')
            .lean();

            console.log("lastLedger", lastLedger);
            

        const previousBalance = lastLedger ? lastLedger.totalStock : 0;

        console.log("previousBalance", previousBalance);
        

        // 5. Calculate new balance
        const quantityChange = Number(invoiceItem.quantity);
        const newTotalStock = previousBalance + quantityChange;

        if (newTotalStock < 0) {
            throw new CustomError(statusCode.BadRequest, "Stock cannot go negative");
        }

        console.log("newTotalStock", newTotalStock);

        // 6. Create ledger entry
        const pricePerUnit = Number(invoiceItem.totalAmount / invoiceItem.quantity).toFixed(2);

        console.log("pricePerUnit", pricePerUnit);
        

        const newEntry = new StockLedger({
            businessUnit: purchaseInvoice.businessUnit,
            branch: purchaseInvoice.branch,
            warehouse: purchaseInvoice.warehouse,
            isVendorLevel: purchaseInvoice.isVendorLevel,
            isBuLevel: purchaseInvoice.isBuLevel,
            isBranchLevel: purchaseInvoice.isBranchLevel,
            isWarehouseLevel: purchaseInvoice.isWarehouseLevel,

            productMainStock: productMainStock,
            pricePerUnit,
            in: quantityChange,
            purchaseInvoiceId: purchaseInvoice._id,
            totalStock: newTotalStock,
            date: purchaseInvoice.piDate || new Date(),
            type: "purchase",
            createdBy: mainUser._id,
        });

        await newEntry.save();

        // 7. Mark item as audited
        const enrichedItems = purchaseInvoice.items.map((item) => {
            if (item.itemName.productMainStock.toString() === productMainStock.toString()) {
                return { ...item.toObject(), audited: true };
            }
            return item;
        });

        purchaseInvoice.items = enrichedItems;

        // 8. Auto-complete when all items are audited
        const allAudited = enrichedItems.every((item) => item.audited === true);
        if (allAudited) {
            purchaseInvoice.auditStatus = 'completed';
        }

        // 9. Save invoice (partial progress is now persisted)
        await purchaseInvoice.save();

        console.log(`✅ Audited item ${productMainStock} for invoice ${purchaseInvoiceId}`);
        return purchaseInvoice;

    } catch (error) {
        console.error(`❌ Audit failed for item ${productMainStock} in invoice ${purchaseInvoiceId}:`, error);
        throw new CustomError(
            error.statusCode || statusCode.InternalServerError,
            `Audit failed: ${error.message}`
        );
    }
};

module.exports = { auditItem };



