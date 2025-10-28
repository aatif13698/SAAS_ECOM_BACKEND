
// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const supplierSchema = require("../../client/model/supplier");
const supplierTransportationSchema = require("../../client/model/transportation");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SupplierTransport = clientConnection.model('supplierTransport', supplierTransportationSchema)
        return await SupplierTransport.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, transportId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SupplierTransport = clientConnection.model('supplierTransport', supplierTransportationSchema)
        const transport = await SupplierTransport.findById(transportId);
        if (!transport) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierTransportNotFound);
        }
        Object.assign(transport, updateData);
        return  await transport.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);
    }
};

const getById = async (clientId, transportId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SupplierTransport = clientConnection.model('supplierTransport', supplierTransportationSchema)
        const transport = await SupplierTransport.findById(transportId);
        if (!transport) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierTransportNotFound);
        }
        return supplier;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SupplierTransport = clientConnection.model('supplierTransport', supplierTransportationSchema)
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [transports, total] = await Promise.all([
            SupplierTransport.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            SupplierTransport.countDocuments(filters),
        ]);
        return { count: total, transports };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, transportId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SupplierTransport = clientConnection.model('supplierTransport', supplierTransportationSchema)
        const transport = await SupplierTransport.findById(transportId);
        if (!transport) {
            throw new CustomError(statusCode.NotFound, message.lblSupplierTransportNotFound);
        }
        Object.assign(transport, data);
        return await transport.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
};
