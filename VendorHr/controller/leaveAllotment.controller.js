const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const leaveAllotmentService = require("../service/leaveAllotment.service");
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

            workingDepartment,
            leaveCategories,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            workingDepartment,
            level,
        ];


        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (leaveCategories.length == 0) {
            return res.status(statusCode.BadRequest).send({ message: "category is required." });
        }

        // Base data object 
        const dataObject = {
            workingDepartment,
            leaveCategories,
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
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired })

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

        const newLeaveAllotment = await leaveAllotmentService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblLeaveCategoryCreatedSuccess,
            data: { leaveAllotmentId: newLeaveAllotment._id },
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
            leaveAllotmentId,
            level,
            businessUnit,
            branch,
            warehouse,

            workingDepartment,
            leaveCategories,
        } = req.body;

        const mainUser = req.user;
        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            leaveAllotmentId,
            level,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (leaveCategories.length == 0) {
            return res.status(statusCode.BadRequest).send({ message: "category is required." });
        }

        // Base data object 
        const dataObject = {
            workingDepartment,
            leaveCategories,
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
        const updated = await leaveAllotmentService.update(clientId, leaveAllotmentId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblLeaveCategoryUpdatedSuccess,
        });
    } catch (error) {
        next(error);
    }

};


exports.allotmentByDepartment = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, level = "vendor", levelId = "", workingDepartment } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            workingDepartment
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
        const result = await leaveAllotmentService.allotmentByDepartment(clientId, filters);
        return res.status(statusCode.OK).send({
            message: "Leave Allotments found successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get particular  
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, leaveAllotmentId } = req.params;
        if (!clientId || !leaveAllotmentId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const asset = await leaveAllotmentService.getById(clientId, leaveAllotmentId);
        return res.status(200).send({
            message: message.lblLeaveCategoryFoundSucessfully,
            data: asset,
        });
    } catch (error) {
        next(error)
    }
};


