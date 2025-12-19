



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const branchService = require("../services/branch.service");



const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const { getClientDatabaseConnection } = require("../../db/connection");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const clinetBranchSchema = require("../../client/model/branch");
const { generateLedgerGroup } = require("../../helper/accountingHelper");
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
const uploadIconToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/branch/${uuidv4()}${fileExtension}`;
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


// create Branch by vendor
exports.createBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnit, name, emailContact, contactNumber, gstInNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        const mainUser = req.user;
        console.log("body", req.body);

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address || !gstInNumber) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            businessUnit, name,
            emailContact,
            contactNumber,
            gstInNumber,
            city, state, country, ZipCode, address,
            houseOrFlat,
            streetOrLocality,
            landmark,
            createdBy: mainUser._id,
        }

        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.gstInDocument = uploadResult.url;
            dataObject.gstInDocumentKey = uploadResult.key; // Store S3 key for potential future deletion
        }


        const newBranch = await branchService.create(clientId, { ...dataObject }, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblBranchCreatedSuccess,
            data: { businessUnitId: newBranch._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  Branch by vendor
exports.updateBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, branchId, businessUnit, name, emailContact, contactNumber, gstInNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdIdAndClientIdRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address || !gstInNumber) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            gstInNumber, businessUnit, name, emailContact, contactNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark
        }

        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.gstInDocument = uploadResult.url;
            dataObject.gstInDocumentKey = uploadResult.key; // Store S3 key for potential future deletion
        }


        const updated = await branchService.update(clientId, branchId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBranchUpdatedSuccess,
            data: { branchId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular Branch by vendor
exports.getParticularBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, branchId } = req.params;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdIdAndClientIdRequired,
            });
        }
        const branch = await branchService.getById(clientId, branchId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};


// list Branch by vendor
exports.listBranch = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                    { city: { $regex: keyword.trim(), $options: "i" } },
                    { state: { $regex: keyword.trim(), $options: "i" } },
                    { country: { $regex: keyword.trim(), $options: "i" } },
                    { name: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await branchService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblBranchFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactiveBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblBranchIdAndClientIdRequired,
            });
        }
        const updatedChair = await branchService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listBranch(req, res, next)
    } catch (error) {
        next(error);
    }
};

exports.refreshMasterGroupForBusinessUnit = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { branchId, clientId } = req.body;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdIdAndClientIdRequired,
            });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Branch = clientConnection.model('branch', clinetBranchSchema);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);
        const branch = await Branch.findById(branchId);

        if (!branch) {
            return res.status(statusCode.BadRequest).send({
                message: "Branch not found"
            })
        }
        const existingMaster = await LedgerGroup.findOne({ businessUnit: branch.businessUnit, branch: branchId, isBranchLevel: true, groupName: "Capital Account" });
        if (existingMaster) {
            return res.status(400).send({
                message: "Master Gruops already refreshed.",
            });
        }
        await generateLedgerGroup(branch.businessUnit, branchId, null, "branch", mainUser, clientId);
        return res.status(statusCode.OK).send({
            message: "Group refreshed Successfully"
        })
    } catch (error) {
        next(error);
    }
};




// Soft delete Branch by vendor
exports.softDeleteBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, branchId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdAndClientIdRequired,
            });
        }
        await branchService.deleted(clientId, branchId, softDelete = true)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Branch by vendor
exports.restoreBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, branchId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await branchService.restore(clientId, branchId)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error)
    }
};



// get branch by business unit
exports.getBranchByBusinessUnit = async (req, res, next) => {
    try {
        const { clientId, businessUnitId } = req.params;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const branch = await branchService.getBranchByBusiness(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};




