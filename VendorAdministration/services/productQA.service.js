// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const clientUserSchema = require("../../client/model/user");
const httpStatusCode = require("../../utils/http-status-code");
const clientAssetRequestSchema = require("../../client/model/assetRequest");
const questionAndAnswerProductSchema = require("../../client/model/questionAndAnswerProduct");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema)
        return await ProductQA.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, qaId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema)
        const qa = await ProductQA.findById(qaId);
        if (!qa) {
            throw new CustomError(statusCode.NotFound, message.lblProductQANotFound);
        }
        Object.assign(qa, updateData);
        await qa.save();
        return qa

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};






const getByProductMainSockId = async (clientId, productMainStockId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema)
        const qa = await ProductQA.find({productMainStockId: productMainStockId}).select("question answer");
        if (!qa) {
            throw new CustomError(statusCode.NotFound, message.lblProductQANotFound);
        }
        return qa;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema)
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [qas, total] = await Promise.all([
            ProductQA.find(filters).skip(skip),
            ProductQA.countDocuments(filters),
        ]);
        return { count: total, qas };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const activeInactive = async (clientId, qaId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema)
        const qa = await ProductQA.findById(qaId);
        if (!qa) {
            throw new CustomError(statusCode.NotFound, message.lblProductQANotFound);
        }
        Object.assign(qa, data);
        return await qa.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getByProductMainSockId,
    list,
    activeInactive,
};
