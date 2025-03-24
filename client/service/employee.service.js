// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetUserSchema = require("../../client/model/user");

const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");

const CustomError = require("../../utils/customeError")


const createEmployee = async (clientId, employeedata) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);


        const existingEmployee = await User.findOne({
            $or: [{ email: employeedata.email },
            { phone: employeedata?.phone }
            ],
        });
        if (existingEmployee) {
            throw new CustomError(statusCode.Conflict, message.lblEmployeeAlreadyExists);
        }

        return await User.create(employeedata);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating employee: ${error.message}`);
    }
};

const updateEmployee = async (clientId, employeeId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await User.findById(employeeId);

        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }


        const existingEmployee = await User.findOne({
            $or: [{ email: updateData.email },
            { phone: updateData?.phone }
            ],
        });

        if (existingEmployee) {
            throw new CustomError(statusCode.Conflict, message.lblEmployeeAlreadyExists);
        }
        const prevEmailAndPhone = { emial: employee.email, phone: employee.phone }

        // Update chair properties
        Object.assign(employee, updateData);
        await employee.save();
        return prevEmailAndPhone

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating employee: ${error.message}`);
    }
};


const getEmployeeById = async (clientId, employeeId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);

        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await User.findById(employeeId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }

        return employee;

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting employee: ${error.message}`);
    }
};

const listEmployee = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [employees, total] = await Promise.all([
            User.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            User.countDocuments(filters),
        ]);

        return { count: total, employees };

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing employee: ${error.message}`);
    }
};



const activeInactiveEmployee = async (clientId, employeeId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const employee = await User.findById(employeeId);

        if (!employee) {
            throw new CustomError(statusCode.NotFound, message.lblEmployeeNotFound);
        }
        // Update employee properties
        Object.assign(employee, updateData);
        return await employee.save();

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive employee: ${error.message}`);
    }
};


module.exports = {
    createEmployee,
    updateEmployee,
    getEmployeeById,
    listEmployee,
    activeInactiveEmployee,
};
