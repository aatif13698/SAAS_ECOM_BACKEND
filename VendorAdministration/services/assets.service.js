// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const clientUserSchema = require("../../client/model/user");
const httpStatusCode = require("../../utils/http-status-code");
const clientAssetRequestSchema = require("../../client/model/assetRequest");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");
const clinetBranchSchema = require("../../client/model/branch");
const clinetWarehouseSchema = require("../../client/model/warehouse");


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
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const asset = await Asset.findById(assetId)
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
                path: "assignedTo",
                model: User,
                select: "firstName lastName email phone profileImage"
            })
            .populate({
                path: "auditLogs.user",
                model: User,
                select: "firstName lastName email profileImage"
            });
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
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [assets, total] = await Promise.all([
            Asset.find(filters).skip(skip).sort({ _id: -1 })
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
                    path: "assignedTo",
                    model: User,
                    select: "firstName lastName email phone profileImage"
                }),
            Asset.countDocuments(filters),
        ]);
        return { count: total, assets };
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




const assignToEmployee = async (clientId, assetId, empId, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new CustomError(statusCode.NotFound, message.lblAssetNotFound);
        }
        if (asset.status !== 'available') {
            throw new CustomError(statusCode.BadRequest, "Asset not available");
        }
        const employee = await User.findById(empId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, "Employee not found");
        }
        asset.assignedTo = empId;
        asset.status = 'assigned';
        employee.assignedAssets.push({ assetId: asset._id });
        asset.auditLogs.push({ action: 'assigned', user: mainUser._id, date: new Date() });
        await asset.save();
        await employee.save();
        return asset
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error in assigning asset : ${error.message}`);
    }
};



const unAssignToEmployee = async (clientId, useId, assetId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const asset = await Asset.findById(assetId);
        if (!asset) {
            throw new CustomError(statusCode.NotFound, message.lblAssetNotFound);
        }
        if (asset.status !== 'available') {
            throw new CustomError(statusCode.BadRequest, "Asset not available");
        }
        const employee = await User.findById(useId);
        if (!employee) {
            throw new CustomError(statusCode.NotFound, "Employee not found");
        }
        asset.assignedTo = null;
        asset.status = 'available';
        employee.assignedAssets = employee.assignedAssets.filter(id => !id.equals(asset._id));
        asset.auditLogs.push({ action: 'unassigned', user: req.body.updatedBy, date: new Date() });
        await asset.save();
        await employee.save();
        return asset
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error in unassigning asset : ${error.message}`);
    }
};


const createRequest = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const AssetRequest = clientConnection.model('assetRequest', clientAssetRequestSchema)
        return await AssetRequest.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating asset request: ${error.message}`);
    }
};







module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    assignToEmployee,
    unAssignToEmployee,
    createRequest
};
