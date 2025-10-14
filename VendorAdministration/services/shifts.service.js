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

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [shifts, total] = await Promise.all([
            Shift.find(filters).skip(skip),
            Shift.countDocuments(filters),
        ]);
        return { count: total, shifts };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing shift: ${error.message}`);
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


















module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
};
