// services/chairService.js  
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");

const clientChangeShiftSchema = require("../../client/model/shiftChange");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const clientShiftSchema = require("../../client/model/shift");

const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ChangeShift = clientConnection.model('clientChangeShift', clientChangeShiftSchema);
        return await ChangeShift.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ChangeShift = clientConnection.model('clientChangeShift', clientChangeShiftSchema);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);

        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [changeShifts, total] = await Promise.all([
            ChangeShift.find(filters).skip(skip)
                .populate({
                    path: "chosenShift",
                    model: Shift,
                    select: "shiftName"
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
                })
                .populate({
                    path: "createdBy",
                    model: User,
                    select: "firstName lastName email"
                })
            ,
            ChangeShift.countDocuments(filters),
        ]);
        return { count: total, changeShifts };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const update = async (clientId, shiftId, updateData, newShift) => {

    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ChangeShift = clientConnection.model('clientChangeShift', clientChangeShiftSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const changeShift = await ChangeShift.findById(shiftId);
        if (!changeShift) {
            throw new CustomError(statusCode.NotFound, "Shift request not found");
        }
        const emp = await User.findOne({ _id: changeShift.createdBy});

        if(!emp){
            return new CustomError(statusCode.NotFound, "Employee not found");
        }
        emp.shift = newShift;
        await emp.save();
        Object.assign(changeShift, updateData);
        await changeShift.save();
        return changeShift

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};

const activeInactive = async (clientId, shiftId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientChangeShift', clientChangeShiftSchema);
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

const getById = async (clientId, shiftId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientChangeShift', clientChangeShiftSchema);
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);
        }
        return shift;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting shift: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
};  