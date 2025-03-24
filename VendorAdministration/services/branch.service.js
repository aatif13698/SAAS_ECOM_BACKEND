// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError")


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const existing = await Branch.findOne({
            $or: [{ emailContact: data.emailContact },
            { contactNumber: data?.contactNumber }
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblBranchAlreadyExists);
        }
        return await Branch.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating branch : ${error.message}`);
    }
};

const update = async (clientId, branchId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const branch = await Branch.findById(branchId);
        if (!branch) {
            throw new CustomError(statusCode.NotFound, message.lblBusinessUnitNotFound);
        }
        if (data.emailContact && data.emailContact !== branch.emailContact) {
            const emailConflict = await Branch.exists({
                _id: { $ne: branchId },
                emailContact: data.emailContact,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblEmailAlreadyExists);
            }
        }
        if (data.contactNumber && data.contactNumber !== branch.contactNumber) {
            const emailConflict = await Branch.exists({
                _id: { $ne: branchId },
                contactNumber: data.contactNumber,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblPhoneAlreadyExists);
            }
        }
        Object.assign(branch, data);
        return await branch.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating branch: ${error.message}`);
    }
};

const getById = async (clientId, branchId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const branch = await Branch.findById(branchId);
        if (!branch) {
            throw new CustomError(statusCode.NotFound, message.lblBranchNotFound);
        }
        return branch;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting branch: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [branches, total] = await Promise.all([
            Branch.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Branch.countDocuments(filters),
        ]);
        return { count: total, branches };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing branch: ${error.message}`);
    }
};

const activeInactive = async (clientId, branchId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const branch = await Branch.findById(branchId);
        if (!branch) {
            throw new CustomError(statusCode.NotFound, message.lblBranchNotFound);
        }
        Object.assign(branch, data);
        return await branch.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive branch: ${error.message}`);
    }
};

const deleted = async (clientId, businessUnitId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const branch = await Branch.findById(businessUnitId);
        if (!branch) {
            throw new CustomError(statusCode.NotFound, message.lblBranchNotFound);
        }
        if (softDelete) {
            branch.deletedAt = new Date();
            await branch.save();
        } else {
            await branch.remove();
        }
        return branch;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete branch: ${error.message}`);
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
        const branch = await Branch.find({ businessUnit: businessUnitId, isActive : true });
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
