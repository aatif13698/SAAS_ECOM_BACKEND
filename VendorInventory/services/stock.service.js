// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productStockSchema = require("../../client/model/productStock");
const productBlueprintSchema = require("../../client/model/productBlueprint");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const existing = await Stock.findOne({
            $or: [{ product: data.product },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblStockAlreadyExists);
        }
        return await Stock.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating: ${error.message}`);
    }
};

const update = async (clientId, stockId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        const existing = await Stock.findOne({
            $and: [
                { _id: { $ne: stockId } },
                {
                    $or: [{ product: updateData.product },
                    ],
                },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblStockAlreadyExists);
        }
        Object.assign(stock, updateData);
        return  await stock.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};

const getById = async (clientId, stockId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        return stock;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [stocks, total] = await Promise.all([
            Stock.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).populate({
                path: 'product',
                model: ProductBluePrint,
                select: 'name _id'
            }),
            Stock.countDocuments(filters),
        ]);
        return { count: total, stocks };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const getAllStock = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const [stocks, total] = await Promise.all([
            Stock.find(filters).sort({ _id: -1 }).populate({
                path: 'product',
                model: ProductBluePrint,
                select: 'name _id'
            }),
            Stock.countDocuments(filters),
        ]);
        return { count: total, stocks };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, stockId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)
        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        Object.assign(stock, data);
        return await stock.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const deleted = async (clientId, stockId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Stock = clientConnection.model('productStock', productStockSchema)

        const stock = await Stock.findById(stockId);
        if (!stock) {
            throw new CustomError(statusCode.NotFound, message.lblStockNotFound);
        }
        if (softDelete) {
            stock.deletedAt = new Date();
            await stock.save();
        } else {
            await stock.remove();
        }
        return stock;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,

    getAllStock
};
