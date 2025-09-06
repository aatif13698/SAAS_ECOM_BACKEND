// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");

const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const clientAssetSchema = require("../../client/model/asset");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        return await Asset.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating asset : ${error.message}`);
    }
};

const update = async (clientId, assetId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new CustomError(statusCode.NotFound, message.lblAssetNotFound);
        }
        Object.assign(asset, updateData);
        await asset.save();
        return asset

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating asset: ${error.message}`);
    }
};



const getById = async (clientId, assetId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new CustomError(statusCode.NotFound, message.lblAssetNotFound);
        }
        return asset;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting asset: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [asset, total] = await Promise.all([
            Asset.find(filters).skip(skip),
            Asset.countDocuments(filters),
        ]);
        return { count: total, asset };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing asset: ${error.message}`);
    }
};


const activeInactive = async (clientId, assetId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new CustomError(statusCode.NotFound, message.lblAssetNotFound);
        }
        Object.assign(asset, data);
        return await asset.save();
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
