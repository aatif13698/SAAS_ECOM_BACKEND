// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const financialYearSchema = require("../../client/model/financialYear");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const financialYear = await FinancialYear.create(data);
        return financialYear
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating financial year : ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [financialYears, total] = await Promise.all([
            FinancialYear.find(filters).skip(skip).limit(limit),
            FinancialYear.countDocuments(filters),
        ]);
        return { count: total, financialYears };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing financial year: ${error.message}`);
    }
};

const all = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const [financialYears] = await Promise.all([
            FinancialYear.find({})
        ]);
        return { financialYears };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing financial year: ${error.message}`);
    }
};

const activeInactive = async (clientId, financialYearId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const financialYear = await FinancialYear.findById(financialYearId);
        if (!financialYear) {
            throw new CustomError(statusCode.NotFound, message.lblFinancialYearNotFound);
        }
        Object.assign(financialYear, data);
        return await financialYear.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const update = async (clientId, financialYearId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const financialYear = await FinancialYear.findById(financialYearId);
        if (!financialYear) {
            throw new CustomError(statusCode.NotFound, message.lblFinancialYearNotFound);
        }
        Object.assign(financialYear, updateData);
        await financialYear.save();
        return financialYear
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating financial year: ${error.message}`);
    }
};
































module.exports = {
    create,
    list,
    update,
    activeInactive,
    all
};
