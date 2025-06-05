// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const supplierSchema = require("../../client/model/supplier");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)
        const existing = await Supplier.findOne({
            $or: [{ emailContact: data.emailContact },
            { contactNumber: data?.contactNumber }
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblSupplierAlreadyExists);
        }
        return await Supplier.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating supplier : ${error.message}`);
    }
};

const update = async (clientId, supplierId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const User = clientConnection.model('clientUsers', clinetUserSchema);
        const Supplier = clientConnection.model('supplier', supplierSchema)
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
        }
        const existing = await User.findOne({
            $and: [
                { _id: { $ne: supplierId } },
                {
                    $or: [{ emailContact: updateData.emailContact },
                        { contactNumber: updateData?.contactNumber }
                    ],
                },
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblSupplierAlreadyExists);
        }
        Object.assign(supplier, updateData);
        return  await supplier.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating supplier: ${error.message}`);
    }
};

const getById = async (clientId, supplierId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
        }
        return supplier;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting supplier: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [suppliers, total] = await Promise.all([
            Supplier.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Supplier.countDocuments(filters),
        ]);
        return { count: total, suppliers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing suppliers: ${error.message}`);
    }
};

const activeInactive = async (clientId, supplierId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)
        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
        }
        Object.assign(supplier, data);
        return await supplier.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive supplier: ${error.message}`);
    }
};

const deleted = async (clientId, supplierId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Supplier = clientConnection.model('supplier', supplierSchema)

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierNotFound);
        }
        if (softDelete) {
            supplier.deletedAt = new Date();
            await supplier.save();
        } else {
            await supplier.remove();
        }
        return supplier;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete supplier: ${error.message}`);
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
    activeInactive,
    deleted,
    restore,
    getBranchByBusiness
};
