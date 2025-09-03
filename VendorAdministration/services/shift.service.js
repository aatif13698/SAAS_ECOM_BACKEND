// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");

const clientShiftSchema = require("../../client/model/shift")


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        return await Shift.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating shift : ${error.message}`);
    }
};

const update = async (clientId, shiftId, updateData) => {

    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        Object.assign(shift, updateData);
        await shift.save();
        return shift

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating shift: ${error.message}`);
    }
};



const getById = async (clientId, shiftId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        return shift;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting shift: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            Shift.find(filters).skip(skip),
            Shift.countDocuments(filters),
        ]);
        return { count: total, employees };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing shift: ${error.message}`);
    }
};


const activeInactive = async (clientId, shiftId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        Object.assign(shift, data);
        return await shift.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};
















const deleted = async (clientId, employeeId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await User.findById(employeeId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }
        if (softDelete) {
            employee.deletedAt = new Date();
            await employee.save();
        } else {
            await employee.remove();
        }
        return employee;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete employee: ${error.message}`);
    }
};

const restore = async (clientId, branchId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);

        const branch = await Branch.findById(branchId);
        if (!branch) {
            throw new CustomError(statusCode.NotFound, message.lblChairNotFound);
        }
        branch.deletedAt = null;
        await branch.save();
        return branch;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete branch: ${error.message}`);
    }
};


const getBranchByBusiness = async (clientId, businessUnitId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const branch = await Branch.find({ businessUnit: businessUnitId, isActive: true });
        // if (branch?.length == 0) {
        //     throw new CustomError(statusCode.NotFound, message.lblBranchNotFound);
        // }
        return branch;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting branch: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,
    restore,
    getBranchByBusiness
};
