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



const assetsOfEmployee = async (clientId, empId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema);
        const emp = await User.findById(empId)
            .populate({
                path: "assignedAssets.assetId",
                model: Asset,
            })
        if (!emp) {
            throw new CustomError(statusCode.NotFound, "Employee not found.");
        }
        return emp.assignedAssets;
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

const listAvailableAssets = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const [assets, total] = await Promise.all([
            Asset.find(filters).sort({ _id: -1 })
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
        const AssetRequest = clientConnection.model('assetRequest', clientAssetRequestSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema);

        const emp = await User.findById(data?.employeeId);

        if (!emp) {
            throw new CustomError(statusCode.NotFound, "Employee not found.");
        }


        const dataObject = {
            businessUnit: emp.businessUnit,
            branch: emp.branch,
            warehouse: emp.warehouse,

            isVendorLevel: emp.isVendorLevel,
            isBuLevel: emp.isBuLevel,
            isBranchLevel: emp.isBranchLevel,
            isWarehouseLevel: emp.isWarehouseLevel,

            ...data
        }



        return await AssetRequest.create(dataObject);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating asset request: ${error.message}`);
    }
};


const actionAssetRequest = async (clientId, assetRequestId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const AssetRequest = clientConnection.model('assetRequest', clientAssetRequestSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);

        const request = await AssetRequest.findById(assetRequestId);
        if (!request) {
            throw new CustomError(statusCode.NotFound, "Request not found.");
        };

        const employee = await User.findById(request.employeeId);
        const currentAsset = await Asset.findById(request.assetId);

        if (!currentAsset) {
            throw new CustomError(statusCode.NotFound, "Asset not found.");
        };

        Object.assign(request, data);

        await request.save();

        currentAsset.auditLogs.push({ action: data?.status, user: mainUser._id, date: new Date() });

        if (data.status == "approved") {
            currentAsset.status = "available";
            currentAsset.assignedTo = null;
            employee.assignedAssets = employee.assignedAssets.filter(
                ass => ass.assetId.toString() !== request.assetId.toString()   // ← important if IDs are ObjectId
            );
            await employee.save();

            console.log("employee", employee.assignedAssets);
            
        }

        await currentAsset.save();

        if (data.newAssetId) {
            const newAsset = await Asset.findById(data.newAssetId);
            newAsset.assignedTo = request.employeeId;
            newAsset.status = 'assigned';
            employee.assignedAssets.push({ assetId: data.newAssetId });
            newAsset.auditLogs.push({ action: 'assigned', user: mainUser._id, date: new Date() });
            await newAsset.save();
            await employee.save();
        }
        return request
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating asset request: ${error.message}`);
    }
};


const listAssetRequest = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const AssetRequest = clientConnection.model('assetRequest', clientAssetRequestSchema);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);

        const User = clientConnection.model('clientUsers', clientUserSchema)
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [assetRequests, total] = await Promise.all([
            AssetRequest.find(filters).skip(skip).sort({ _id: -1 })
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
                    path: "employeeId",
                    model: User,
                    select: "firstName lastName email phone profileImage"
                })
                .populate({
                    path: "assetId",
                    model: Asset,
                    select: "assetName"
                }),
            AssetRequest.countDocuments(filters),
        ]);
        return { count: total, assetRequests };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing asset: ${error.message}`);
    }
};


const assetRequestsOfEmployee = async (clientId, empId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Asset = clientConnection.model('clientAsset', clientAssetSchema);
        const AssetRequest = clientConnection.model('assetRequest', clientAssetRequestSchema);
        const User = clientConnection.model('clientUsers', clientUserSchema)
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const Warehouse = clientConnection.model('warehouse', clinetWarehouseSchema);
        const emp = await User.findById(empId);
        if (!emp) {
            throw new CustomError(statusCode.NotFound, "Employee not found.");
        };

        const requests = await AssetRequest.find({ employeeId: empId }).sort({ _id: -1 })
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
                path: "employeeId",
                model: User,
                select: "firstName lastName email phone profileImage"
            })
            .populate({
                path: "assetId",
                model: Asset,
                select: "assetName"
            });

        return requests;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting asset: ${error.message}`);
    }
};







module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    assignToEmployee,
    assetsOfEmployee,
    assetRequestsOfEmployee,
    listAvailableAssets,
    actionAssetRequest,

    unAssignToEmployee,
    createRequest,
    listAssetRequest
};
