// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const purchaseOrderSchema = require("../../client/model/purchaseOrder");
const { model } = require("mongoose");
const supplierSchema = require("../../client/model/supplier");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const existingPo = await PurchaseOrder.findOne({poNumber: data?.poNumber}).lean();
        console.log("existingPo", existingPo);
        
        if(existingPo){
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
            throw new CustomError(statusCode.NotFound, message.lblHolidayNotFound);
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

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [purchaseOrders, total] = await Promise.all([
            PurchaseOrder.find(filters).skip(skip)
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


const activeInactive = async (clientId, purchaseOrderId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const PurchaseOrder = clientConnection.model('purchaseOrder', purchaseOrderSchema);
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
        if (!purchaseOrder) {
            throw new CustomError(statusCode.NotFound, message.lblHolidayNotFound);
        }
        Object.assign(purchaseOrder, data);
        return await purchaseOrder.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
}; 