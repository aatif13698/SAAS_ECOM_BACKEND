// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const clientCustomFieldSchema = require("../../client/model/customField");
const ledgerSchema = require("../../client/model/ledger");


const create = async (clientId, data, mainUser, options = {}) => {
    try {
        const { session } = options; 
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const ledger = await Ledger.create([data], { session }); 
        return ledger[0]; 
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating ledger: ${error.message}`);
    }
};

const update = async (clientId, ledgerId, updateData, mainUser, options = {}) => {
    try {
        const { session } = options; 
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const ledger = await Ledger.findById(ledgerId);
        if (!ledger) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerNotFound);
        }
        Object.assign(ledger, updateData);
        await session.withTransaction(async () => {
            await ledger.save({ session });
        });
        return ledger
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating ledger: ${error.message}`);
    }
};

const getById = async (clientId, ledgerId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const ledger = await Ledger.findById(shiftId);
        if (!ledger) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerNotFound);
        }
        return ledger;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Ledger = clientConnection.model("ledger", ledgerSchema);
        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [ledgers, total] = await Promise.all([
            Ledger.find(filters).skip(skip).limit(limit),
            Ledger.countDocuments(filters),
        ]);
        return { count: total, ledgers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger: ${error.message}`);
    }
};

const activeInactive = async (clientId, groupId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const ledgerGroup = await LedgerGroup.findById(groupId);
        if (!ledgerGroup) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerGroupNotFound);
        }
        Object.assign(ledgerGroup, data);
        return await ledgerGroup.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};






module.exports = {
    create,
    getById,
    list,
    update,
    activeInactive,
};
