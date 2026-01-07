// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const leaveAllotmentSchema = require("../../client/model/leaveAllotment");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveAllotment = clientConnection.model('leaveAllotment', leaveAllotmentSchema);

        const existing = await LeaveAllotment.findOne({
            isVendorLevel: data?.isVendorLevel,
            isBuLevel: data?.isBuLevel,
            isBranchLevel: data?.isBranchLevel,
            isWarehouseLevel: data?.isWarehouseLevel,

            businessUnit: data?.businessUnit ? data?.businessUnit : null,
            branch: data?.branch ? data?.branch : null,
            warehouse: data?.warehouse ? data?.warehouse : null,
            workingDepartment: data?.workingDepartment
        });

        if (existing) {
            existing.leaveCategories = data.leaveCategories;
            return await existing.save()
        } else {
            return await LeaveAllotment.create(data);
        }
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


const allotmentByDepartment = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveAllotment = clientConnection.model('leaveAllotment', leaveAllotmentSchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const [leaveAllotment] = await Promise.all([
            LeaveAllotment.findOne(filters)
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
        ]);
        return { leaveAllotment };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing leave category: ${error.message}`);
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
    allotmentByDepartment,
    getById,
}; 