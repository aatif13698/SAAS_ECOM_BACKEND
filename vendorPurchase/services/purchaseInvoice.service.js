// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");
const purchaseInvoiceSchema = require("../../client/model/purchaseInvoice");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const existingPi = await PurchaseInvoice.findOne({ piNumber: data?.piNumber }).lean();
        console.log("existingPi", existingPi);

        if (existingPi) {
            throw new CustomError(statusCode.BadRequest, 'Purchase invoice number already exists.')
        }
        return await PurchaseInvoice.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
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
        return purchaseOrder;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseInvoice = clientConnection.model('purchaseInvoice', purchaseInvoiceSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema);

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
                }),
            PurchaseInvoice.countDocuments(filters),
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
    update,
    getById,
    list,
    changeStatus,
}; 