// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const clientCustomFieldSchema = require("../../client/model/customField");
const voucherGroupSchema = require("../../client/model/voucherGroup");
const financialYearSchema = require("../../client/model/financialYear");



const create = async (clientId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
        const voucher = await VoucherGroup.create(data);
        return voucher
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating voucher group : ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);

        const { page, limit } = options;
        const skip = (Number(page) - 1) * Number(limit);
        const [voucherGroups, total] = await Promise.all([
            VoucherGroup.find(filters).skip(skip).limit(limit)
                .populate({
                    path: "financialYear",
                    model: FinancialYear
            }),
            VoucherGroup.countDocuments(filters),
        ]);
        return { count: total, voucherGroups };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing voucher group: ${error.message}`);
    }
};

const all = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const [voucherGroups] = await Promise.all([
            VoucherGroup.find(filters)
                .populate({
                    path: "financialYear",
                    model: FinancialYear
            }),
        ]);
        return { voucherGroups };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing voucher group: ${error.message}`);
    }
};

const activeInactive = async (clientId, voucherGroupId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
        const voucherGroup = await VoucherGroup.findById(voucherGroupId);
        if (!voucherGroup) {
            throw new CustomError(statusCode.NotFound, message.lblVoucherGroupNotFound);
        }
        Object.assign(voucherGroup, data);
        return await voucherGroup.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const update = async (clientId, voucherGroupId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const VoucherGroup = clientConnection.model("voucherGroup", voucherGroupSchema);
        const voucherGroup = await VoucherGroup.findById(voucherGroupId);
        if (!voucherGroup) {
            throw new CustomError(statusCode.NotFound, message.lblVoucherGroupNotFound);
        }
        Object.assign(voucherGroup, updateData);
        await voucherGroup.save();
        return voucherGroup
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating voucher group: ${error.message}`);
    }
};


module.exports = {
    create,
    list,
    update,
    activeInactive,
    all
};
