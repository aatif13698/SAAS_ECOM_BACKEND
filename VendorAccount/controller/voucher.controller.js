



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const voucherService = require("../services/voucher.service");
const bcrypt = require("bcrypt");
const clientCustomFieldSchema = require("../../client/model/customField");
const { default: mongoose } = require("mongoose");



// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,

            voucherGroup,
            narration,
            entries,
            currency,
            financialYear,
            isSingleEntry,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            voucherGroup,
            narration,
            entries,
            currency,
            financialYear,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (entries?.length !== 2 && isSingleEntry == false) {
            return res.status(statusCode.BadRequest).send({ message: "Double entry data is required." });
        }

        // Base data object
        const dataObject = {
            voucherGroup,
            narration,
            entries,
            currency,
            financialYear,
            isSingleEntry,
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

        const newVoucherGroup = await voucherService.create(clientId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblVoucherGroupCreatedSuccess,
            data: { voucherGroup: newVoucherGroup },
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
            voucherLinkId,
            level,
            businessUnit,
            branch,
            warehouse,

            voucherGroup,
            narration,
            entries,
            currency,
            financialYear,
            isSingleEntry,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            voucherGroup,
            voucherLinkId,
            narration,
            entries,
            currency,
            financialYear,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (entries?.length !== 2 && isSingleEntry == false) {
            return res.status(statusCode.BadRequest).send({ message: "Double entry data is required." });
        }

        // Base data object
        const dataObject = {
            voucherGroup,
            narration,
            entries,
            currency,
            financialYear,
            isSingleEntry,
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

        const newVoucherGroup = await voucherService.update(clientId, voucherLinkId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblVoucherGroupCreatedSuccess,
            data: { voucherGroup: newVoucherGroup },
        });
    } catch (error) {
        next(error);
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
        let filters = {};
        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: levelId
            }
        }
        const result = await voucherService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblVoucherFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get 
exports.getOne = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, voucherLinkId } = req.params;
        if (!clientId || !voucherLinkId) {
            return res.status(statusCode.BadRequest).send({
                message: "Client id and voucher link id is required",
            });
        }
        const result = await voucherService.getOne(clientId, voucherLinkId);
        return res.status(statusCode.OK).send({
            message: message.lblVoucherFoundSucessfully,
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
        const updated = await voucherService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};



