// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");
const documentRequirementSchema = require("../../client/model/documentRequirement");
const documentCustomFieldSchema = require("../../client/model/documentCustomField");



const create = async (clientId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DocumentRequirement = clientConnection.model("documentRequirement", documentRequirementSchema);
        const CustomField = clientConnection.model("documentCustomField", documentCustomFieldSchema)
        const documentRequirement = await DocumentRequirement.create(data);
        const doc = await DocumentRequirement.findById(documentRequirement._id);
        const fieldArray = [
            {
                name: "fullName",
                label: "Full Name",
                type: "text",
                isRequired: true,
                placeholder: "Enter Full Name.",
                gridConfig: {
                    span: 12,
                    order: 1
                },
                isDeleteAble: false,
                documentRequirementId: doc._id,
                createdBy: mainUser?._id,
            },
        ]
        await CustomField.insertMany(fieldArray);
        return doc
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating document requirement : ${error.message}`);
    }
};

const update = async (clientId, documentRequirementId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DocumentRequirement = clientConnection.model("documentRequirement", documentRequirementSchema);
        const documentRequirement = await DocumentRequirement.findById(documentRequirementId);
        if (!documentRequirement) {
            throw new CustomError(statusCode.NotFound, message.lblDocumentRequirementNotFound);
        }
        const existingDocumentRequirement = await DocumentRequirement.findOne({
            $and: [
                { _id: { $ne: documentRequirementId } },
                {
                    $or: [{ jobRole: updateData.jobRole }],
                },
            ],
        })
        if (existingDocumentRequirement) {
            throw new CustomError(statusCode.Conflict, message.lblDocumentRequirementAlreadyExists);
        }
        Object.assign(documentRequirement, updateData);
        await documentRequirement.save();
        return documentRequirement
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating document requirement: ${error.message}`);
    }
};

const allField = async (clientId, documentRequirementId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const CustomField = clientConnection.model("documentCustomField", documentCustomFieldSchema)
        const [fields] = await Promise.all([
            CustomField.find({ documentRequirementId: documentRequirementId }),
        ]);
        return { fields };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing document requirement fields: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DocumentRequirement = clientConnection.model("documentRequirement", documentRequirementSchema);
        const { page, limit } = options;
        console.log("options", options);

        const skip = (Number(page) - 1) * Number(limit);
        console.log("skip", skip);

        const [documentRequirements, total] = await Promise.all([
            DocumentRequirement.find(filters).skip(skip).limit(limit),
            DocumentRequirement.countDocuments(filters),
        ]);
        return { count: total, documentRequirements };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing document requirement: ${error.message}`);
    }
};

const activeInactive = async (clientId, groupId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DocumentRequirement = clientConnection.model("documentRequirement", documentRequirementSchema);
        const documentRequirement = await DocumentRequirement.findById(groupId);
        if (!documentRequirement) {
            throw new CustomError(statusCode.NotFound, message.lblDocumentRequirementNotFound);
        }
        Object.assign(documentRequirement, data);
        return await documentRequirement.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const all = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const DocumentRequirement = clientConnection.model("documentRequirement", documentRequirementSchema);
        const [documentRequirements] = await Promise.all([
            DocumentRequirement.find(filters),
        ]);
        return { documentRequirements };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing document requirement: ${error.message}`);
    }
};

module.exports = {
    create,
    list,
    all,
    allField,

    update,
    activeInactive,
};
