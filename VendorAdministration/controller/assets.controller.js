



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const assetService = require("../services/assets.service");
const bcrypt = require("bcrypt")


// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,

            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
        } = req.body;


        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            notes,
            expirationDate,
        ];

        console.log("requiredFields", requiredFields);


        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
            createdBy: mainUser._id,
        };

        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        const newAsset = await assetService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblAssetCreatedSuccess,
            data: { workingDepartmentId: newAsset._id },
        });
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {

    try {
        const {
            clientId,
            assetId,
            level,
            businessUnit,
            branch,
            warehouse,

            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
        } = req.body;

        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            notes,
            expirationDate
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
            createdBy: mainUser._id,
        };

        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level
        if (businessUnit && businessUnit !== "null") {
            dataObject.businessUnit = businessUnit;
        }
        if (branch && branch !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse && warehouse !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        // update 
        const updated = await assetService.update(clientId, assetId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblAssetUpdatedSuccess,
        });

    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, asset } = req.params;
        
        if (!clientId || !asset) {
            return res.status(400).send({
                message: message.lblAssetIdAndClientIdRequired,
            });
        }
        const assetDetail = await assetService.getById(clientId, asset);
        return res.status(200).send({
            message: message.lblAssetFoundSucessfully,
            data: assetDetail,
        });
    } catch (error) {
        next(error)
    }
};


// list
exports.list = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { assetName: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }

        const result = await assetService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblAssetFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive
exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblEmployeeIdIdAndClientIdRequired,
            });
        }
        const updated = await assetService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// assign
exports.assign = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { assetId, empId, clientId } = req.body;
        const newAssigned = await assetService.assignToEmployee(clientId, assetId, empId, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblAssetCreatedSuccess,
            data: { newAssigned: newAssigned._id },
        });
    } catch (error) {
        next(error);
    }
};


// assets of employee
exports.getAssetsOfEmployee = async (req, res, next) => {
    try {
        const { clientId, empId } = req.params;
        
        if (!clientId || !empId) {
            return res.status(400).send({
                message: "Client id and employee id is required.",
            });
        }
        const assets = await assetService.assetsOfEmployee(clientId, empId);
        return res.status(200).send({
            message: message.lblAssetFoundSucessfully,
            data: assets,
        });
    } catch (error) {
        next(error)
    }
};


// unassign
// exports.unAssign = async (req, res, next) => {
//     try {
//         const { useId } = req.body;
//         const newAssigned = await assetService.assignToEmployee(clientId, useId, req.params.assetId);
//         return res.status(statusCode.OK).send({
//             message: message.lblAssetCreatedSuccess,
//             data: { newAssigned: newAssigned._id },
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// create request
exports.createRequest = async (req, res, next) => {
    try {
        const {
            clientId,
            assetId,
            employeeId,
            requestType,
            reason,
            notes,
        } = req.body;
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            assetId,
            employeeId,
            requestType,
            reason,
            notes,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            assetId,
            employeeId,
            requestType,
            reason,
            notes,
            createdBy: mainUser._id,
        };
        const newRequest = await assetService.createRequest(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: "Request submitted successfully",
            data: { request: newRequest._id },
        });
    } catch (error) {
        next(error);
    }
};

exports.listAssetRequest = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { assetName: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }

        const result = await assetService.listAssetRequest(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: "Asset requests found successfully. ",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


exports.getAssetRequestOfEmployee = async (req, res, next) => {
    try {
        const { clientId, empId } = req.params;
        
        if (!clientId || !empId) {
            return res.status(400).send({
                message: "Client id and employee id is required.",
            });
        }
        const assets = await assetService.assetRequestsOfEmployee(clientId, empId);
        return res.status(200).send({
            message: "Requests found successfully.",
            data: assets,
        });
    } catch (error) {
        next(error)
    }
};



















































