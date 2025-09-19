// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const clientCustomFieldSchema = require("../../client/model/customField");



const create = async (clientId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const CustomField = clientConnection.model("customField", clientCustomFieldSchema)
        const ledgerGruop = await LedgerGroup.create(data);
        const group = await LedgerGroup.findById(ledgerGruop._id).populate({
            path: 'parentGroup',
            model: LedgerGroup,
        })
        const fieldArray = [
            {
                name: "name",
                label: "Name",
                type: "text",
                isRequired: true,
                placeholder: "Enter Name.",
                gridConfig: {
                    span: 12,
                    order: 1
                },
                isDeleteAble: false,
                groupId: ledgerGruop._id,
                createdBy: mainUser?._id,
            },
        ]
        await CustomField.insertMany(fieldArray);
        return group
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating ledger group : ${error.message}`);
    }
};

const all = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const [ledgerGroup] = await Promise.all([
            LedgerGroup.find(filters),
        ]);
        return { ledgerGroup };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger group: ${error.message}`);
    }
};

const allField = async (clientId, groupId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("customField", clientCustomFieldSchema)
        const [fields] = await Promise.all([
            CustomField.find({ groupId: groupId }),
        ]);
        return { fields };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger group fields: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [ledgerGroup, total] = await Promise.all([
            LedgerGroup.find(filters).skip(skip)
                .populate({
                    path: 'parentGroup',
                    model: LedgerGroup,
                }),
            LedgerGroup.countDocuments(filters),
        ]);
        return { count: total, ledgerGroup };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger group: ${error.message}`);
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

const update = async (clientId, shiftId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const ledgerGroup = await LedgerGroup.findById(shiftId);
        if (!ledgerGroup) {
            throw new CustomError(statusCode.NotFound, message.lblLedgerGroupNotFound);
        }
        Object.assign(ledgerGroup, updateData);
        await ledgerGroup.save();
        return ledgerGroup
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating ledger group: ${error.message}`);
    }
};
















const getById = async (clientId, shiftId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        const workingDepartment = await WorkingDepartment.findById(shiftId);
        if (!workingDepartment) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        return workingDepartment;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting ledger group: ${error.message}`);
    }
};




module.exports = {
    create,
    list,
    all,
    allField,


    update,
    getById,
    activeInactive,
};
