// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const leaveAllotmentSchema = require("../../client/model/leaveAllotment");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveAllotment = clientConnection.model('leaveAllotment', leaveAllotmentSchema);
        return await LeaveAllotment.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, leaveAllotmentId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveAllotment = clientConnection.model('leaveAllotment', leaveAllotmentSchema);
        const leaveAllotment = await LeaveAllotment.findById(leaveAllotmentId);
        if (!leaveAllotment) {
            throw new CustomError(statusCode.NotFound, "Allotment not found.");
        }
        Object.assign(leaveAllotment, updateData);
        await leaveAllotment.save();
        return leaveAllotment
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};


const getById = async (clientId, leaveAllotmentId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveAllotment = clientConnection.model('leaveAllotment', leaveAllotmentSchema);
        const leaveAllotment = await LeaveAllotment.findById(leaveAllotmentId);
        if (!leaveAllotment) {
            throw new CustomError(statusCode.NotFound, "Allotment not found.");
        }
        return leaveAllotment;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting leave category: ${error.message}`);
    }
};






module.exports = {
    create,
    update,
    getById,
}; 