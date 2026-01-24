// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const statementSchema = require("../../client/model/statement");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Statement = clientConnection.model("statement", statementSchema);
        const existing = await Statement.findOne({
            type: data.type
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, "Statement already exists");
        }
        const statement = await Statement.create(data);
        return statement
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Statement = clientConnection.model("statement", statementSchema);
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [statements, total] = await Promise.all([
            Statement.find(filters).skip(skip).limit(limit),
            Statement.countDocuments(filters),
        ]);
        return { count: total, statements };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const statementType = async (clientId, type) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Statement = clientConnection.model("statement", statementSchema);
        const statement = await Statement.findOne({ type });
        if (!statement) {
            throw new CustomError(statusCode.NotFound, "Statement not found");
        }
        return statement
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};

const activeInactive = async (clientId, statementId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Statement = clientConnection.model("statement", statementSchema);
        const statement = await Statement.findById(statementId);
        if (!statement) {
            throw new CustomError(statusCode.NotFound, "Statement not found");
        }
        Object.assign(statement, data);
        return await statement.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const update = async (clientId, statementId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Statement = clientConnection.model("statement", statementSchema);
        const statement = await Statement.findById(statementId);
        if (!statement) {
            throw new CustomError(statusCode.NotFound, "Statement not found");
        }
        Object.assign(statement, updateData);
        await statement.save();
        return statement
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};
































module.exports = {
    create,
    list,
    update,
    activeInactive,
    statementType
};
