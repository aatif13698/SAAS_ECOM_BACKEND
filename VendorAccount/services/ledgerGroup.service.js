// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const clientCustomFieldSchema = require("../../client/model/customField");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const { path } = require("../../client/model/user");
const { model } = require("mongoose");
const ledgerSchema = require("../../client/model/ledger");



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
                name: "nickName",
                label: "Nick Name",
                type: "text",
                isRequired: true,
                placeholder: "Enter Nick Name.",
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
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);

        const { page, limit } = options;
        console.log("options", options);

        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [ledgerGroup, total] = await Promise.all([
            LedgerGroup.find(filters).skip(skip).limit(limit).sort({ _id: -1 })
                .populate({
                    path: 'parentGroup',
                    model: LedgerGroup,
                })
                .populate({
                    path: "businessUnit",
                    model: BusinessUnit,
                    select: "name"
                })
                .populate({
                    path: "branch",
                    model: Branch,
                    select: "name"
                })
                .populate({
                    path: "warehouse",
                    model: Warehouse,
                    select: "name"
                }),
            LedgerGroup.countDocuments(filters),
        ]);
        return { count: total, ledgerGroup };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger group: ${error.message}`);
    }
};

const allLedgerGroup = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const [ledgerGroup] = await Promise.all([
            LedgerGroup.find(filters)
        ]);
        return { ledgerGroup };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing ledger group: ${error.message}`);
    }
};




const allCashAndBankGroup = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const Ledger = clientConnection.model("ledger", ledgerSchema);

        const [bank, cash] = await Promise.all([
            LedgerGroup.findOne({ ...filters, groupName: "Cash-At-Bank" }),
            LedgerGroup.findOne({ ...filters, groupName: "Cash-in-hand" }),
        ]);

        const [bankLedgers, cashLedgers] = await Promise.all([
            Ledger.find({...filters, ledgerGroupId: bank._id }),
            Ledger.find({...filters, ledgerGroupId: cash._id}),
        ]);




        return { bankLedgers, cashLedgers };
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
    allLedgerGroup,
    allCashAndBankGroup,



    update,
    getById,
    activeInactive,
};
