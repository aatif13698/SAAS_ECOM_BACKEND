



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const stockService = require("../services/stock.service");
const orderService = require("../services/orders.service")
const bcrypt = require("bcrypt");
const httpStatusCode = require("../../utils/http-status-code");
const orderSchema = require("../../client/model/order");




// list 
exports.list = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;

        console.log("req.query", req.query);

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { orderNumber: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await orderService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblStockFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};



// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, orderId } = req.params;
        if (!clientId || !orderId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const data = await orderService.getById(clientId, orderId);
        return res.status(200).send({
            message: message.lblOrderFoundSuccessfully,
            data: data,
        });
    } catch (error) {
        next(error)
    }
};


// update order status
exports.updateOrderStatus = async (req, res, next) => {
    let clientConnection;
    let session;
    try {
        const { clientId, status, orderId } = req.body;
        console.log("req.body",req.body);
        
        // const { orderId } = req.params;
        const userId = req.user ? req.user._id : null;
        if (!clientId) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Client ID is required",
            });
        }
        if (!userId) {
            return res.status(httpStatusCode.Unauthorized).json({
                success: false,
                message: "User authentication required",
            });
        }
        if (!status || !["APPROVED", "DISAPPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"].includes(status)) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Invalid or missing status",
            });
        }
        clientConnection = await getClientDatabaseConnection(clientId);
        session = await clientConnection.startSession();
        session.startTransaction();
        const Order = clientConnection.model("Order", orderSchema);
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            await session.abortTransaction();
            return res.status(httpStatusCode.NotFound).json({
                success: false,
                message: "Order not found",
            });
        }
        if (order.status === "PENDING" && status === "PENDING") {
            await session.abortTransaction();
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Order is already in PENDING status",
            });
        }
        order.status = status;
        order.activities.push({
            status,
            updatedBy: userId,
            timestamp: new Date(),
            notes: req.body.notes || `Status updated to ${status}`,
        });
        await order.save({ session });
        await session.commitTransaction();
        res.status(httpStatusCode.OK).json({
            success: true,
            message: `Order status updated to ${status}`,
            data: order,
        });
    } catch (error) {
        if (session) {
            await session.abortTransaction();
        }
        console.error("Error updating order status:", error);
        next(error);
    } finally {
        if (session) {
            session.endSession();
        }
    }
};






// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,

        } = req.body;
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
        };

        // Create 
        const created = await stockService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblStockCreatedSuccess,
            data: { empId: created._id },
        });
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {

    try {
        const {
            clientId,
            stockId,

            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
        };

        // Create 
        const updated = await stockService.update(clientId, stockId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblStockUpdatedSuccess,
            data: { empId: updated._id },
        });
    } catch (error) {
        next(error);
    }

};




exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const updated = await stockService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete 
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, stockId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !stockId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        await stockService.deleted(clientId, stockId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};





