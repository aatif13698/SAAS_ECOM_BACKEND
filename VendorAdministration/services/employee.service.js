// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");
const clientShiftSchema = require("../../client/model/shift");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const { path } = require("pdfkit");


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
            throw new CustomError(statusCode.Conflict, message.lblEmployeeAlreadyExists);
        }
        return await clientUser.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating employee : ${error.message}`);
    }
};

const update = async (clientId, employeeId, updateData) => {

    console.log("updateData", updateData);

    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await User.findById(employeeId);

        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }


        const existingEmployee = await User.findOne({
            $and: [
                { _id: { $ne: employeeId } },
                {
                    $or: [{ email: updateData.email },
                    { phone: updateData?.phone }
                    ],
                },
            ],
        });

        if (existingEmployee) {
            throw new CustomError(statusCode.Conflict, message.lblEmployeeAlreadyExists);
        }
        const prevEmailAndPhone = { email: employee.email, phone: employee.phone }

        // Update chair properties
        Object.assign(employee, updateData);
        await employee.save();
        return prevEmailAndPhone

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating employee: ${error.message}`);
    }
};

const getById = async (clientId, branchId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const user = await User.findById(branchId);
        if (!user) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }
        return user;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting branch: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const clientRole = clientConnection.model('clientRoles', clientRoleSchema);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [employees, total] = await Promise.all([
            User.find(filters).skip(skip).populate({
                path: "role",
                model: clientRole,
                select: "id _id name"
            }).populate({
                path: "workingDepartment",
                model: WorkingDepartment,
                select: "departmentName"
            }).populate({
                path: "shift",
                model: Shift,
                select: "shiftName"
            })
                .limit(limit).sort({ _id: -1 }),
            User.countDocuments(filters),
        ]);
        return { count: total, employees };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing employee: ${error.message}`);
    }
};

const listAllByCurrentLevel = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const clientRole = clientConnection.model('clientRoles', clientRoleSchema);
        const Shift = clientConnection.model('clientShift', clientShiftSchema);
        const WorkingDepartment = clientConnection.model('clientWorkingDepartment', clientWorkingDepartmentSchema);
        const [employees] = await Promise.all([
            User.find(filters).populate({
                path: "role",
                model: clientRole,
                select: "id _id name"
            }).populate({
                path: "workingDepartment",
                model: WorkingDepartment,
                select: "departmentName"
            }).populate({
                path: "shift",
                model: Shift,
                select: "shiftName"
            })
            .sort({ _id: -1 }),
        ]);
        return { employees };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, employeeId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const employee = await User.findById(employeeId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }
        Object.assign(employee, data);
        return await employee.save();
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
    listAllByCurrentLevel,
    activeInactive,
    deleted,
    restore,
    getBranchByBusiness
};
