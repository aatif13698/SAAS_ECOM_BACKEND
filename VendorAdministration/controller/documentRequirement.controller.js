



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const documentRequirementService = require("../services/documentRequirement.service")
const bcrypt = require("bcrypt");
const documentCustomFieldSchema = require("../../client/model/documentCustomField");

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
            workDepartment,
            jobRole,

            name,
        } = req.body;
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            name,
            workDepartment,
            jobRole,
        ];
        console.log("requiredFields", requiredFields);
        
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            workDepartment,
            jobRole,
            name,
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
        const newDocumentRequirement = await documentRequirementService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblDocumentRequirementCreatedSuccess,
            data: { document: newDocumentRequirement },
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
            documentRequirementId,
            level,
            businessUnit,
            branch,
            warehouse,

            workDepartment,
            jobRole,

            name,
        } = req.body;

        console.log("req.body", req.body);


        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            workDepartment,
            jobRole,

            name,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            workDepartment,
            jobRole,

            name,
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
        const updated = await documentRequirementService.update(clientId, documentRequirementId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblDocumentRequirementUpdatedSuccess,
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

        const result = await documentRequirementService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblDocumentRequirementFoundSucessfully,
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
                message: message.lblDocumentRequirementIdIdAndClientIdRequired,
            });
        }
        const updated = await documentRequirementService.activeInactive(clientId, id, {
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
        const { clientId, documentRequirementId } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!documentRequirementId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblDocumentRequirementIdIdRequired,
            });
        }
        const result = await documentRequirementService.allField(clientId, documentRequirementId);
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

            documentRequirementId,
            clientId
        } = req.body;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!name || !label || !type) {
            return res.status(400).send({ error: 'Name, label, and type are required' });
        }
        if (!documentRequirementId) {
            return res.status(httpStatusCode.BadRequest).send({
                success: false,
                message: message.lblDocumentRequirementIdIdRequired,
                errorCode: "ID_MISSIING",
            });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("documentCustomField", documentCustomFieldSchema)
        // Check for duplicate field name (optional, depending on your requirements)
        const existingField = await CustomField.findOne({ name, documentRequirementId });
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
            { documentRequirementId },
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
            documentRequirementId: documentRequirementId
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
        const { documentRequirementId, clientId, fieldId } = req.params;
        if (!documentRequirementId || !fieldId) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: message.lblRequiredFieldMissing,
                errorCode: "FIELD_MISSING",
            });
        }
        if (
            !mongoose.Types.ObjectId.isValid(documentRequirementId) ||
            !mongoose.Types.ObjectId.isValid(fieldId)
        ) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Invalid ID format",
                errorCode: "INVALID_ID",
            });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("documentCustomField", documentCustomFieldSchema)

        const field = await CustomField.findOne({
            _id: fieldId,
            documentRequirementId: documentRequirementId
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

exports.updateFieldOrder = async (req, res, next) => {
    try {
        const { clientId, documentRequirementId } = req.params;
        const { fields } = req.body;
        const user = req.user;

        if (!documentRequirementId || !clientId) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: message.lblRequiredFieldMissing,
                errorCode: "FIELD_MISSING",
            });
        }

        if (!clientId || !documentRequirementId || !fields || !Array.isArray(fields) || fields.length === 0) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: message?.lblRequiredFieldMissing,
                errorCode: "FIELD_MISSING",
            });
        }

        if (
            !mongoose.Types.ObjectId.isValid(documentRequirementId) ||
            !fields.every((f) => mongoose.Types.ObjectId.isValid(f.fieldId))
        ) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Invalid ID format",
                errorCode: "INVALID_ID",
            });
        }

        if (
            !fields.every((f) => typeof f.order === "number" && f.order >= 1 && Number.isInteger(f.order))
        ) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Invalid fields data",
                errorCode: "INVALID_FIELDS",
            });
        }

        const orders = fields.map((f) => f.order);
        if (new Set(orders).size !== orders.length) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "DUPLICATE_ORDERS",
                errorCode: "DUPLICATE_ORDERS",
            });
        }

        const fieldIds = fields.map((f) => f.fieldId);

        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("documentCustomField", documentCustomFieldSchema)

        const existingFields = await CustomField.find({
            _id: { $in: fieldIds },
            documentRequirementId: documentRequirementId
        });

        if (existingFields.length !== fields.length) {
            return res.status(httpStatusCode.BadRequest).json({
                success: false,
                message: "Some fields do not belong to this ledger group",
                errorCode: "NOT_FOUND",
            });
        }

        const updatePromises = fields.map(({ fieldId, order }) =>
            CustomField.updateOne(
                { _id: fieldId, documentRequirementId },
                { $set: { "gridConfig.order": order } }
            )
        );
        await Promise.all(updatePromises);

        return res.status(httpStatusCode.OK).json({
            success: true,
            message: "Field order updated successfully",
        });
    } catch (error) {
        console.error("Error updating field order:", error);
        return res.status(httpStatusCode.InternalServerError).json({
            success: false,
            message: message.lblInternalServerError,
            errorCode: SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};






















































































