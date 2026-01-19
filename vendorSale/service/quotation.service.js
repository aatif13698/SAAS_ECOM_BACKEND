// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const quotationSchema = require("../../client/model/saleQuotation");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");
const crypto = require('crypto');
const clinetUserSchema = require("../../client/model/user");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const existingSq = await Quotation.findOne({ sqNumber: data?.poNumber }).lean();
        if (existingSq) {
            throw new CustomError(statusCode.BadRequest, 'Quotation number already exists.')
        }
        return await Quotation.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, quotationId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const quotation = await Quotation.findById(quotationId);
        if (!quotation) {
            throw new CustomError(statusCode.NotFound, "Quotation not found.");
        }
        Object.assign(quotation, updateData);
        await quotation.save();
        return quotation
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, quotationId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Quotation = clientConnection.model('saleQuotation', quotationSchema);
        const Client = clientConnection.model('clientUsers',clinetUserSchema);
        const quotation = await Quotation.findById(quotationId)
            .populate({
                path: "customer",
                model: Client,
            });
        if (!quotation) {
            throw new CustomError(statusCode.NotFound, "Quotation not found.");
        }
        return quotation;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('saleQuotation', quotationSchema);
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


const changeStatus = async (clientId, quotationId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('saleQuotation', quotationSchema);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);

        const purchaseOrder = await PurchaseOrder.findById(quotationId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblPurchaseOrderNotFound);
        }
        if (data.status == "invoiced") {
            const Supplier = clientConnection.model("supplier", supplierSchema);
            console.log("purchaseOrder.supplier", purchaseOrder.supplier);
            
            const supplier = await Supplier.findById(purchaseOrder.supplier.toString());
            let supplierLedger = null;
            if (!supplier) {
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
                balance: purchaseOrder.grandTotal,
                createdBy: purchaseOrder.createdBy,
            }

            await PurchaseInvoice.create(invoiceData)
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