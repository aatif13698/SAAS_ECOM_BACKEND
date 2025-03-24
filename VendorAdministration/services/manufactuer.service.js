// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetManufacturerSchema = require("../../client/model/manufacturer")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");




const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const existing = await Manufacturer.findOne({
            $or: [{ name: data.name }],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblManufacturerAlreadyExists);
        }
        return await Manufacturer.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating manufacturer: ${error.message}`);
    }
};

const update = async (clientId, manufacturerId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const manufacturer = await Manufacturer.findById(manufacturerId);
        if (!manufacturer) {
            throw new CustomError(statusCode.NotFound, message.lblManufacturerNotFound);
        }
        if (data.name && data.name !== manufacturer.name) {
            const conflict = await Manufacturer.exists({
                _id: { $ne: manufacturerId },
                name: data.name,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblManufacturerAlreadyExists);
            }
        }
        Object.assign(manufacturer, data);
        return await manufacturer.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating manufacturer: ${error.message}`);
    }
};

const getById = async (clientId, manufacturerId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const manufacturer = await Manufacturer.findById(manufacturerId);
        if (!manufacturer) {
            throw new CustomError(statusCode.NotFound, message.lblManufacturerNotFound);
        }
        return manufacturer;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting manufacturer: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [manufacturers, total] = await Promise.all([
            Manufacturer.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Manufacturer.countDocuments(filters),
        ]);
        return { count: total, manufacturers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing manufacturer: ${error.message}`);
    }
};

const getActive = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const [manufacturers] = await Promise.all([
            Manufacturer.find(filters).sort({ _id: -1 }),
        ]);
        return { manufacturers };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing manufacturer: ${error.message}`);
    }
};

const activeInactive = async (clientId, manufacturerId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const manufacturer = await Manufacturer.findById(manufacturerId);
        if (!manufacturer) {
            throw new CustomError(statusCode.NotFound, message.lblManufacturerNotFound);
        }
        Object.assign(manufacturer, data);
        return await manufacturer.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive manufacturer: ${error.message}`);
    }
};

const deleted = async (clientId, manufacturerId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Manufacturer = clientConnection.model('manufacturer', clinetManufacturerSchema);
        const manufacturer = await Manufacturer.findById(manufacturerId);
        if (!manufacturer) {
            throw new CustomError(statusCode.NotFound, message.lblManufacturerNotFound);
        }
        if (softDelete) {
            manufacturer.deletedAt = new Date();
            await manufacturer.save();
        } else {
            await manufacturer.remove();
        }
        return manufacturer;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete manufacturer: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    getActive,
    activeInactive,
    deleted,
};
