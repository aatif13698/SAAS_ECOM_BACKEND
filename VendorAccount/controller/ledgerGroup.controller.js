



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const ledgerGroupService = require("../services/ledgerGroup.service");
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

            groupName,
            hasParent,
            parentGroup,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            groupName,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (hasParent == true && parentGroup == "") {
            return res.status(statusCode.BadRequest).send({ message: "Parent group is required." });
        }

        // Base data object
        const dataObject = {
            groupName,
            hasParent,
            parentGroup: hasParent == true ? parentGroup : null,
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

        const newLedgerGroup = await ledgerGroupService.create(clientId, dataObject, mainUser);

        return res.status(statusCode.OK).send({
            message: message.lblLedgerGroupCreatedSuccess,
            data: { group: newLedgerGroup },
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
            groupId,
            level,
            businessUnit,
            branch,
            warehouse,

            groupName,
            hasParent,
            parentGroup,
        } = req.body;

        console.log("req.body", req.body);


        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            groupName,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (hasParent == true && parentGroup == "") {
            return res.status(statusCode.BadRequest).send({ message: "Parent group is required." });
        }

        // Base data object
        const dataObject = {
            groupName,
            hasParent,
            parentGroup: hasParent == true ? parentGroup : null,
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
        const updated = await ledgerGroupService.update(clientId, groupId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblLedgerGroupUpdatedSuccess,
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
        let filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { groupName: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                // isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                isWarehouseLevel: levelId
            }
        }

        const result = await ledgerGroupService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblLedgerGroupFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// all
exports.all = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            hasParent: false,
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                // isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                isWarehouseLevel: levelId
            }
        }
        const result = await ledgerGroupService.all(clientId, filters,);
        return res.status(statusCode.OK).send({
            message: message.lblLedgerGroupFoundSucessfully,
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
        const updated = await ledgerGroupService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// all field
exports.allField = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, groupId } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!groupId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblLedgerGroupIdIdRequired,
            });
        }
        const result = await ledgerGroupService.allField(clientId, groupId);
        return res.status(statusCode.OK).send({
            message: "Fields found successfully.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.createField = async (req, res, next) => {
    try {
        const user = req.user;
        const {
            name,
            label,
            type,
            options,
            isRequired,
            placeholder,
            validation,
            aspectRation,
            gridConfig,

            groupId,
            clientId
        } = req.body;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        console.log("req.body", req.body);
        // Basic validation
        if (!name || !label || !type) {
            return res.status(400).send({ error: 'Name, label, and type are required' });
        }
        if (!groupId) {
            return res.status(httpStatusCode.BadRequest).send({
                success: false,
                message: message.lblLedgerGroupIdIdRequired,
                errorCode: "ID_MISSIING",
            });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("customField", clientCustomFieldSchema)
        // Check for duplicate field name (optional, depending on your requirements)
        const existingField = await CustomField.findOne({ name, groupId });
        if (existingField) {
            return res.status(400).send({ error: 'A field with this name already exists' });
        }
        // Validate gridConfig
        let finalGridConfig = { span: 12, order: 1 }; // Default

        if (gridConfig) {
            if (gridConfig.span < 1 || gridConfig.span > 12) {
                return res.status(400).send({ error: 'Grid span must be between 1 and 12' });
            }
            if (typeof gridConfig.order !== 'number') {
                return res.status(400).send({ error: 'Grid order must be a number' });
            }
        }
        const maxOrderField = await CustomField.findOne(
            { groupId },
            { "gridConfig.order": 1 }
        )
            .sort({ "gridConfig.order": -1 })
            .lean();
        finalGridConfig.order = maxOrderField ? maxOrderField.gridConfig.order + 1 : 1;
        // Validate options for select/multiselect
        if (['select', 'multiselect'].includes(type) && (!options || !Array.isArray(options) || options.length === 0)) {
            return res.status(400).send({ error: 'Options are required for select and multiselect types' });
        }
        // Validate file type specific fields
        if (type === 'file') {
            if (validation && validation.fileTypes && !Array.isArray(validation.fileTypes)) {
                return res.status(400).send({ error: 'fileTypes must be an array' });
            }
            if (validation && validation.maxSize && (typeof validation.maxSize !== 'number' || validation.maxSize <= 0)) {
                return res.status(400).send({ error: 'maxSize must be a positive number' });
            }
        }
        // Create new custom field
        const customField = new CustomField({
            name,
            label,
            type,
            options: options || [],
            isRequired: isRequired || false,
            placeholder,
            valictRation: aspectRation,
            gridConfig: finalGridConfig,
            creadation: validation || {},
            aspetedBy: req.user._id,
            groupId: groupId
        });
        // Save to database
        const savedField = await customField.save();
        res.status(201).send({
            message: 'Custom field created successfully',
            data: savedField
        });
    } catch (error) {
        console.error('Error creating custom field:', error);
        res.status(500).send({ error: 'Internal server error', details: error.message });
    }
};

// delete field
exports.deleteField = async (req, res, next) => {
    try {
        const user = req.user;
        const { groupId,clientId, fieldId } = req.params;
        if (!groupId || !fieldId) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: message.lblRequiredFieldMissing,
                errorCode: "FIELD_MISSING",
            });
        }
        if (
            !mongoose.Types.ObjectId.isValid(groupId) ||
            !mongoose.Types.ObjectId.isValid(fieldId)
        ) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Invalid ID format",
                errorCode: "INVALID_ID",
            });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("customField", clientCustomFieldSchema)

        const field = await CustomField.findOne({
            _id: fieldId,
            groupId: groupId
        });

        if (!field) {
            return res.status(httpStatusCode.NotFound).json({
                success: false,
                message: "Field not found",
                errorCode: "NOT_FOUND",
            });
        }
        await CustomField.deleteOne({ _id: fieldId });
        return res.status(httpStatusCode.OK).json({
            success: true,
            message: "Field deleted successfully",
        });
    } catch (error) {
        console.error("Field deletion error:", error);
        return res.status(httpStatusCode.InternalServerError).json({
            success: false,
            message: message.lblInternalServerError,
            errorCode: "SERVER_ERROR",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};



































// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, shiftId } = req.params;
        if (!clientId || !shiftId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const shift = await ledgerGroupService.getById(clientId, shiftId);
        return res.status(200).send({
            message: message.lblShiftFoundSucessfully,
            data: employee,
        });
    } catch (error) {
        next(error)
    }
};






















































