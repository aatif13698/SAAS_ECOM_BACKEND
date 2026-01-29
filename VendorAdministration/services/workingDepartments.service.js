// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");

const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clinetWarehouseSchema = require("../../client/model/warehouse");

const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        return await WorkingDepartment.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating working deparment : ${error.message}`);
    }
};

const update = async (clientId, shiftId, updateData) => {

    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        const workingDepartment = await WorkingDepartment.findById(shiftId);
        if (!workingDepartment) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        Object.assign(workingDepartment, updateData);
        await workingDepartment.save();
        return workingDepartment

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating working deparment: ${error.message}`);
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
        throw new CustomError(error.statusCode || 500, `Error getting working deparment: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
         const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [department, total] = await Promise.all([
            WorkingDepartment.find(filters).skip(skip).sort({ _id: -1 })
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
                })
            ,
            WorkingDepartment.countDocuments(filters),
        ]);
        return { count: total, department };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing working deparment: ${error.message}`);
    }
};

const activeInactive = async (clientId, shiftId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        const workingDepartment = await WorkingDepartment.findById(shiftId);
        if (!workingDepartment) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        Object.assign(workingDepartment, data);
        return await workingDepartment.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const all = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        const [departments] = await Promise.all([
            WorkingDepartment.find(filters),
        ]);
        return { departments };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing departments: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    all
};  