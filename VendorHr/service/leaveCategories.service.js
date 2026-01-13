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
const leaveRequestsSchema = require("../../client/model/leaveRequests");
const clinetUserSchema = require("../../client/model/user");


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

const allLeaveHistory = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);
        const LeaveBalance = clientConnection.model('leaveBalance', leaveBalanceSchema);
        const LeaveRequest = clientConnection.model('leaveRequests', leaveRequestsSchema);
        const [leaveHistory] = await Promise.all([
            LeaveRequest.find(filters)
                .populate({
                    path: "leaveTypeId",
                    model: LeaveCategory,
                })
        ]);
        return { leaveHistory };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};



const applyLeave = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LeaveRequest = clientConnection.model('leaveRequests', leaveRequestsSchema);
        const LeaveBalance = clientConnection.model('leaveBalance', leaveBalanceSchema);
        const Employee = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await Employee.findById(data.employeeId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, "Employee not found.");
        }

        const leaveBalance = await LeaveBalance.findOne({ employeeId: data.employeeId });

        if (!leaveBalance) {
            throw new CustomError(statusCode.NotFound, "Leave balance not found.");
        }
        const filteredCategory = leaveBalance.leaveCategories.find((item) => {
            if (item.id == data.leaveTypeId) {
                return item
            }
        });
        if (!filteredCategory) {
            throw new CustomError(statusCode.NotFound, "Leave category not found.");
        }
        if (Number(filteredCategory.allocated) - Number(filteredCategory.taken) == 0) {
            throw new CustomError(statusCode.NotFound, "Leave balance is zero in this category.");
        };
        const newLeaveCategories = leaveBalance.leaveCategories.map((cat) => {
            if (cat.id == data.leaveTypeId) {
                return {
                    ...cat,
                    taken: Number(cat.taken) + Number(data.totalDays)
                }
            } else {
                return cat
            }
        });
        const newDataObject = {
            ...data,
            businessUnit: employee.businessUnit,
            branch: employee.branch,
            warehouse: employee.warehouse,

            isVendorLevel: employee.isVendorLevel,
            isBuLevel: employee.isBuLevel,
            isBranchLevel: employee.isBranchLevel,
            isWarehouseLevel: employee.isWarehouseLevel,
        }
        const request = await LeaveRequest.create(newDataObject);
        leaveBalance.leaveCategories = newLeaveCategories;
        await leaveBalance.save();
        return request;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};



const listLeaveRequests = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        console.log("filters", filters);

        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const LeaveRequest = clientConnection.model('leaveRequests', leaveRequestsSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [leaverequests, total] = await Promise.all([
            LeaveRequest.find(filters).skip(skip)
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
                    path: "employeeId",
                    model: User,
                    select: "firstName lastName email"
                })
                .populate({
                    path: "leaveTypeId",
                    model: LeaveCategory,
                })
                .limit(limit).sort({ _id: -1 }),
            LeaveRequest.countDocuments(filters),
        ]);
        return { count: total, leaverequests };
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
    allLeaveHistory,
    activeInactive,
    applyLeave,
    listLeaveRequests
}; 