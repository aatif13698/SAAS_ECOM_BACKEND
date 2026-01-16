// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const purchaseOrderSchema = require("../../client/model/purchaseOrder");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const crypto = require('crypto');


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const existingPo = await PurchaseOrder.findOne({ poNumber: data?.poNumber }).lean();
        console.log("existingPo", existingPo);

        if (existingPo) {
            throw new CustomError(statusCode.BadRequest, 'Purchase order number already exists.')
        }
        return await PurchaseOrder.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, purchaseOrderId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseOrderNotFound);
        }
        Object.assign(purchaseOrder, updateData);
        await purchaseOrder.save();
        return purchaseOrder
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating purchaseOrder: ${error.message}`);
    }
};


const getById = async (clientId, purchaseOrderId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId)
            .populate({
                path: "supplier",
                model: Supplier,
                select: "-items"
            });
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseOrderNotFound);
        }
        return purchaseOrder;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

        console.log("options", options);


        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [purchaseOrders, total] = await Promise.all([
            PurchaseOrder.find(filters)
                .skip(skip)
                .sort({ createdAt: -1 })  // Sort by creation date descending (latest first)
                .limit(Number(limit))
                .populate({
                    path: "supplier",
                    model: Supplier,
                    select: "-items"
                }),
            PurchaseOrder.countDocuments(filters),
        ]);
        return { count: total, purchaseOrders };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const changeStatus = async (clientId, purchaseOrderId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseOrderNotFound);
        }
        if (data.status == "invoiced") {
            const Supplier = clientConnection.model("supplier", supplierSchema);
            const supplier = await Supplier.findById(purchaseOrder.supplier);
            let supplierLedger = null;
            if (supplier) {
                throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
            }
            if (!supplier.ledgerLinkedId) {
                throw new CustomError(statusCode.NotFound, "Supplier ledger id not found.");
            }
            supplierLedger = supplier.ledgerLinkedId;
            const invoiceData = {
                businessUnit: purchaseOrder.businessUnit,
                branch: purchaseOrder.branch,
                warehouse: purchaseOrder.warehouse,

                isVendorLevel: purchaseOrder.isVendorLevel,
                isBuLevel: purchaseOrder.isBuLevel,
                isBranchLevel: purchaseOrder.isBranchLevel,
                isWarehouseLevel: purchaseOrder.isWarehouseLevel,

                supplier: purchaseOrder.supplier, // Assumed ref to Supplier model
                supplierLedger: supplierLedger,
                shippingAddress: purchaseOrder.shippingAddress,
                piNumber: crypto.randomInt(100000, 1000000).toString(), // Unique for business integrity
                items: purchaseOrder.items,
                notes: purchaseOrder.notes,
                isInterState: purchaseOrder.isInterState, // Determines IGST vs CGST/SGST
                roundOff: purchaseOrder.roundOff,
                status: "full_due",
                createdBy: purchaseOrder.createdBy, 
            }



        }


        Object.assign(purchaseOrder, data);
        return await purchaseOrder.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error in changing status: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    changeStatus,
}; 