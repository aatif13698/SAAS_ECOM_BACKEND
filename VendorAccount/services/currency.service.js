// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const currencySchema = require("../../client/model/currency");

const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Currency = clientConnection.model("currency", currencySchema);
        const currency = await Currency.create(data);
        return currency
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating currency : ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Currency = clientConnection.model("currency", currencySchema);
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [currencies, total] = await Promise.all([
            Currency.find(filters).skip(skip).limit(limit),
            Currency.countDocuments(filters),
        ]);
        return { count: total, currencies };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing currency: ${error.message}`);
    }
};

const activeInactive = async (clientId, currencyId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Currency = clientConnection.model("currency", currencySchema);
        const currency = await Currency.findById(currencyId);
        if (!currency) {
            throw new CustomError(statusCode.NotFound, message.lblCurrencyNotFound);
        }
        Object.assign(currency, data);
        return await currency.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const update = async (clientId, currencyId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Currency = clientConnection.model("currency", currencySchema);
        const currency = await Currency.findById(currencyId);
        if (!currency) {
            throw new CustomError(statusCode.NotFound, message.lblCurrencyNotFound);
        }
        Object.assign(currency, updateData);
        await currency.save();
        return currency
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error currency: ${error.message}`);
    }
};

module.exports = {
    create,
    list,
    update,
    activeInactive,
};



