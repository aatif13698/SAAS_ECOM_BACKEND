// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const clientUser = clientConnection.model('clientUsers', clinetUserSchema);

        const existing = await clientUser.findOne({
            $or: [{ email: data.email },
            { phone: data?.phone }
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblCustomerAlreadyExists);
        }
        return await clientUser.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating customer : ${error.message}`);
    }
};

const update = async (clientId, customerId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const customer = await User.findById(customerId);
        if (!customer) {
            throw new CustomError(statusCode.NotFound, message.lblCustomerNotFound);
        }
        const existing = await User.findOne({
            $and: [
                { _id: { $ne: customerId } },
                {
                    $or: [{ email: updateData.email },
                    { phone: updateData?.phone }
                    ],
                },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblCustomerAlreadyExists);
        }
        const prevEmailAndPhone = { email: customer.email, phone: customer.phone }
        // Update chair properties
        Object.assign(customer, updateData);
        await customer.save();
        return prevEmailAndPhone
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating customer: ${error.message}`);
    }
};

const getById = async (clientId, customerId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const user = await User.findById(customerId);
        if (!user) {
            throw new CustomError(statusCode.NotFound, message.lblCustomerNotFound);
        }
        return user;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting customer: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [customers, total] = await Promise.all([
            User.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            User.countDocuments(filters),
        ]);
        return { count: total, customers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing customer: ${error.message}`);
    }
};

const getAllCustomer = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const [customers, total] = await Promise.all([
            User.find(filters).sort({ _id: -1 }),
            User.countDocuments(filters),
        ]);
        return { count: total, customers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting customer: ${error.message}`);
    }
};

const activeInactive = async (clientId, customerId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const customer = await User.findById(customerId);
        if (!customer) {
            throw new CustomError(statusCode.NotFound, message.lblCustomerNotFound);
        }
        Object.assign(customer, data);
        return await customer.save();
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
    getAllCustomer,
    update,
    getById,
    list,
    activeInactive,
    deleted,
    restore,
    getBranchByBusiness
};
