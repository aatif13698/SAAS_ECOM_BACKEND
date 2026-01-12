// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const leaveCategorySchema = require("../../client/model/leaveCategories");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");
const leaveBalanceSchema = require("../../client/model/leaveBalance");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        return await LeaveCategory.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating leave category : ${error.message}`);
    }
};

const update = async (clientId, leaveCategoryId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId);
        if (!leaveCategory) {
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound);
        }
        Object.assign(leaveCategory, updateData);
        await leaveCategory.save();
        return leaveCategory
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating leave category: ${error.message}`);
    }
};


const getById = async (clientId, leaveCategoryId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId);
        if (!leaveCategory) {
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound);
        }
        return leaveCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting leave category: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [leaveCategories, total] = await Promise.all([
            LeaveCategory.find(filters).skip(skip)
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
            LeaveCategory.countDocuments(filters),
        ]);
        return { count: total, leaveCategories };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing leave category: ${error.message}`);
    }
};


const activeInactive = async (clientId, leaveCategoryId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId);
        if (!leaveCategory) {
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound);
        }
        Object.assign(leaveCategory, data);
        return await leaveCategory.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};



const all = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const [leaveCategories] = await Promise.all([
            LeaveCategory.find(filters)
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
            LeaveCategory.countDocuments(filters),
        ]);
        return { leaveCategories };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing leave category: ${error.message}`);
    }
};

const allLeaveBalance = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const LeaveBalance = clientConnection.model('leaveBalance', leaveBalanceSchema)

        const [leaveBalance] = await Promise.all([
            LeaveBalance.findOne(filters)
                .populate({
                    path: "leaveCategories.id",
                    model: LeaveCategory,
                })
        ]);
        return { leaveBalance };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    all,
    allLeaveBalance,
    activeInactive,
}; 