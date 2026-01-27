



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const statementService = require("../service/statement.service")
const bcrypt = require("bcrypt");
const clientCustomFieldSchema = require("../../client/model/customField");
const { default: mongoose } = require("mongoose");


const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
// DigitalOcean Spaces setup
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    s3ForcePathStyle: true,
    maxRetries: 5,
    retryDelayOptions: { base: 500 },
    httpOptions: { timeout: 60000 },
});

// Helper function to upload file to DigitalOcean Spaces
const uploadProductImageToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/stocks/${uuidv4()}${fileExtension}`;
    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Metadata: {
            'original-filename': file.originalname
        }
    };
    try {
        const { Location } = await s3.upload(params).promise();
        return {
            success: true,
            url: Location,
            key: fileName
        };
    } catch (error) {
        console.log("error in s3", error);

        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
};



// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            title,
            description,
            type,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            title,
            description,
            type,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            title,
            description,
            type,
            createdBy: mainUser._id,
        };
        const newStatement = await statementService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: "Statement created successfully",
            data: { newStatement },
        });
    } catch (error) {
        next(error);
    }
};

// list
exports.list = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        console.log("req.query", req.query);
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
        };
        const result = await statementService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: "Statement found successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// all
exports.statementType = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, type } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!type) {
            return res.status(statusCode.BadRequest).send({
                message: "Type is required",
            });
        }

        const result = await statementService.statementType(clientId, type);
        return res.status(statusCode.OK).send({
            message: "Statement found success.",
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
                message: message.lblFinancialYearIdAndClientIdRequired,
            });
        }
        const updated = await statementService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {
    try {
        const {
            clientId,
            statementId,
            title,
            description,
            type,
        } = req.body;




        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            title,
            description,
            type,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            title,
            description,
            type,
        };

        // update 
        const updated = await statementService.update(clientId, statementId, dataObject);
        return res.status(statusCode.OK).send({
            message: "Statement updated successfully",
        });
    } catch (error) {
        next(error);
    }

};

// create
exports.createAbout = async (req, res, next) => {
    try {
        const {
            clientId,
            title,
            description,
            type,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            title,
            description,
            type,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            title,
            description,
            type,
            createdBy: mainUser._id,
        };

        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadProductImageToS3(file, clientId);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }
        const newStatement = await statementService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: "Statement created successfully",
            data: { newStatement },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateAbout = async (req, res, next) => {
    try {
        const {
            clientId,
            id,
            title,
            description,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            id,
            title,
            description,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            title,
            description,
            createdBy: mainUser._id,
        };

        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadProductImageToS3(file, clientId);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }
        const updatedStatement = await statementService.update(clientId, id, dataObject);
        return res.status(statusCode.OK).send({
            message: "Statement updated successfully",
            data: { updatedStatement },
        });
    } catch (error) {
        next(error);
    }
};



exports.listAbout = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId } = req.query;
        console.log("req.query", req.query);
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const result = await statementService.listAbout(clientId);
        return res.status(statusCode.OK).send({
            message: "Statement found successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.aboutById = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, id } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!id) {
            return res.status(statusCode.BadRequest).send({
                message: "Id is required",
            });
        }

        const result = await statementService.aboutById(clientId, id);
        return res.status(statusCode.OK).send({
            message: "Statement found success.",
            data: result,
        });
    } catch (error) {
        next(error);
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
        const shift = await statementService.getById(clientId, shiftId);
        return res.status(200).send({
            message: message.lblShiftFoundSucessfully,
            data: employee,
        });
    } catch (error) {
        next(error)
    }
};






















































