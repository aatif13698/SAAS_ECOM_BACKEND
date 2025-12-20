// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const { generateLedgerGroup, generateVoucherGroup } = require("../../helper/accountingHelper");

const create = async (clientId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const existing = await Warehouse.findOne({
            $or: [{ emailContact: data.emailContact },
            { contactNumber: data?.contactNumber }
            ],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblWarehouseAlreadyExists);
        }
        const newWarehouse = await Warehouse.create(data);
        await generateLedgerGroup(newWarehouse.businessUnit, newWarehouse.branchId, newWarehouse._id, "warehouse", mainUser, clientId);
        await generateVoucherGroup(newWarehouse.businessUnit, newWarehouse.branchId, newWarehouse._id, "warehouse", mainUser, clientId);
        return newWarehouse
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating warehouse : ${error.message}`);
    }
};

const update = async (clientId, warehouseId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        if (data.emailContact && data.emailContact !== warehouse.emailContact) {
            const emailConflict = await Warehouse.exists({
                _id: { $ne: warehouseId },
                emailContact: data.emailContact,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblEmailAlreadyExists);
            }
        }
        if (data.contactNumber && data.contactNumber !== warehouse.contactNumber) {
            const emailConflict = await Branch.exists({
                _id: { $ne: warehouseId },
                contactNumber: data.contactNumber,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblPhoneAlreadyExists);
            }
        }
        Object.assign(warehouse, data);
        return await warehouse.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating warehouse: ${error.message}`);
    }
};

const getById = async (clientId, warehouseId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        return warehouse;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting warehouse: ${error.message}`);
    }
};

const getByBranch = async (clientId, branchId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const warehouse = await Warehouse.find({ branchId: branchId });
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        return warehouse;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting warehouse: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [warehouses, total] = await Promise.all([
            Warehouse.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Warehouse.countDocuments(filters),
        ]);
        return { count: total, warehouses };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing warehouse: ${error.message}`);
    }
};

const activeInactive = async (clientId, warehouseId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        Object.assign(warehouse, data);
        return await warehouse.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive warehouse: ${error.message}`);
    }
};

const deleted = async (clientId, warehouseId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        if (softDelete) {
            warehouse.deletedAt = new Date();
            await warehouse.save();
        } else {
            await warehouse.remove();
        }
        return warehouse;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete warehouse: ${error.message}`);
    }
};

const restore = async (clientId, warehouseId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new CustomError(statusCode.NotFound, message.lblWarehouseNotFound);
        }
        warehouse.deletedAt = null;
        await warehouse.save();
        return warehouse;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete warehouse: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    getByBranch,
    list,
    activeInactive,
    deleted,
    restore
};
