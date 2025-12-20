



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const businessUnitService = require("../../client/service/businessUnit.service");



const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const { getClientDatabaseConnection } = require("../../db/connection");
const clientLedgerGroupSchema = require("../../client/model/ledgerGroup");
const { generateLedgerGroup, generateVoucherGroup } = require("../../helper/accountingHelper");
const clientVoucharGroupSchema = require("../../client/model/voucherGroup");
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
    const fileName = `saasEcommerce/${clientId}/business/${uuidv4()}${fileExtension}`;
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



// create business unit by vendor
exports.createBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, name, emailContact, contactNumber, tinNumber, businessLicenseNumber, cinNumber, tanNumber, panNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !ZipCode || !address || !panNumber) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        if (!req.files['panDocument']) {
            return res.status(statusCode.BadRequest).send({
                message: 'PAN document is required.',
            });
        }

        if (tinNumber && !req.files['tinDocument']) {
            return res.status(statusCode.BadRequest).send({
                message: 'TIN document is required if TIN number is provided.',
            });
        }
        if (cinNumber && !req.files['cinDocument']) {
            return res.status(statusCode.BadRequest).send({
                message: 'CIN document is required if CIN number is provided.',
            });
        }
        if (tanNumber && !req.files['tanDocument']) {
            return res.status(statusCode.BadRequest).send({
                message: 'TAN document is required if TAN number is provided.',
            });
        }
        if (businessLicenseNumber && !req.files['businessLicenseDocument']) {
            return res.status(statusCode.BadRequest).send({
                message: 'Business License document is required if Business License number is provided.',
            });
        }

        let dataObject = {
            name,
            emailContact,
            contactNumber,
            tinNumber,
            businessLicenseNumber,
            cinNumber,
            tanNumber,
            panNumber,
            city,
            state,
            country,
            ZipCode,
            address,
            houseOrFlat,
            streetOrLocality,
            landmark,
            createdBy: mainUser._id,
        }

        if (req.files['icon']) {
            const uploadResult = await uploadIconToS3(req.files['icon'][0], clientId, 'icon');
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key;
        }

        if (req.files['tinDocument']) {
            const uploadResult = await uploadIconToS3(req.files['tinDocument'][0], clientId, 'tinDocument');
            dataObject.tinDocument = uploadResult.url;
            dataObject.tinDocumentKey = uploadResult.key;
        }

        if (req.files['cinDocument']) {
            const uploadResult = await uploadIconToS3(req.files['cinDocument'][0], clientId, 'cinDocument');
            dataObject.cinDocument = uploadResult.url;
            dataObject.cinDocumentKey = uploadResult.key;
        }

        if (req.files['tanDocument']) {
            const uploadResult = await uploadIconToS3(req.files['tanDocument'][0], clientId, 'tanDocument');
            dataObject.tanDocument = uploadResult.url;
            dataObject.tanDocumentKey = uploadResult.key;
        }

        if (req.files['businessLicenseDocument']) {
            const uploadResult = await uploadIconToS3(req.files['businessLicenseDocument'][0], clientId, 'businessLicenseDocument');
            dataObject.businessLicenseDocument = uploadResult.url;
            dataObject.businessLicenseDocumentKey = uploadResult.key;
        }

        if (req.files['panDocument']) {
            const uploadResult = await uploadIconToS3(req.files['panDocument'][0], clientId, 'panDocument');
            dataObject.panDocument = uploadResult.url;
            dataObject.panDocumentKey = uploadResult.key;
        }

        const newBusinessUnit = await businessUnitService.create(clientId, { ...dataObject }, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblBusinessUnitCreatedSuccess,
            data: { businessUnitId: newBusinessUnit._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  business unit by vendor
exports.updateBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnitId, name, emailContact, contactNumber, tinNumber, businessLicenseNumber, cinNumber, tanNumber, panNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!businessUnitId) {
            return res.status(statusCode.BadRequest).send({
                message: 'Business Unit ID is required.',
            });
        }

        // For update, fields are optional except perhaps key ones, but validate if provided
        let dataObject = {};
        if (name) dataObject.name = name;
        if (emailContact) dataObject.emailContact = emailContact;
        if (contactNumber) dataObject.contactNumber = contactNumber;
        if (tinNumber !== undefined) dataObject.tinNumber = tinNumber;
        if (businessLicenseNumber !== undefined) dataObject.businessLicenseNumber = businessLicenseNumber;
        if (cinNumber !== undefined) dataObject.cinNumber = cinNumber;
        if (tanNumber !== undefined) dataObject.tanNumber = tanNumber;
        if (panNumber) dataObject.panNumber = panNumber;
        if (city) dataObject.city = city;
        if (state) dataObject.state = state;
        if (country) dataObject.country = country;
        if (ZipCode) dataObject.ZipCode = ZipCode;
        if (address) dataObject.address = address;
        if (houseOrFlat !== undefined) dataObject.houseOrFlat = houseOrFlat;
        if (streetOrLocality !== undefined) dataObject.streetOrLocality = streetOrLocality;
        if (landmark !== undefined) dataObject.landmark = landmark;
        dataObject.updatedBy = mainUser._id;

        // Handle file uploads if provided
        if (req.files['icon']) {
            const uploadResult = await uploadIconToS3(req.files['icon'][0], clientId);
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key;
        }

        if (req.files['tinDocument']) {
            const uploadResult = await uploadIconToS3(req.files['tinDocument'][0], clientId);
            dataObject.tinDocument = uploadResult.url;
            dataObject.tinDocumentKey = uploadResult.key;
        }
        // else if (tinNumber && !dataObject.tinDocument) { // Assuming we fetch existing, but for simplicity, optional
        //     // If tinNumber provided without document, error if required
        //     if (tinNumber) {
        //         return res.status(statusCode.BadRequest).send({
        //             message: 'TIN document is required if TIN number is provided.',
        //         });
        //     }
        // }

        if (req.files['cinDocument']) {
            const uploadResult = await uploadIconToS3(req.files['cinDocument'][0], clientId);
            dataObject.cinDocument = uploadResult.url;
            dataObject.cinDocumentKey = uploadResult.key;
        }
        // else if (cinNumber) {
        //     return res.status(statusCode.BadRequest).send({
        //         message: 'CIN document is required if CIN number is provided.',
        //     });
        // }

        if (req.files['tanDocument']) {
            const uploadResult = await uploadIconToS3(req.files['tanDocument'][0], clientId);
            dataObject.tanDocument = uploadResult.url;
            dataObject.tanDocumentKey = uploadResult.key;
        }
        // else if (tanNumber) {
        //     return res.status(statusCode.BadRequest).send({
        //         message: 'TAN document is required if TAN number is provided.',
        //     });
        // }

        if (req.files['businessLicenseDocument']) {
            const uploadResult = await uploadIconToS3(req.files['businessLicenseDocument'][0], clientId);
            dataObject.businessLicenseDocument = uploadResult.url;
            dataObject.businessLicenseDocumentKey = uploadResult.key;
        }
        // else if (businessLicenseNumber) {
        //     return res.status(statusCode.BadRequest).send({
        //         message: 'Business License document is required if Business License number is provided.',
        //     });
        // }

        if (req.files['panDocument']) {
            const uploadResult = await uploadIconToS3(req.files['panDocument'][0], clientId);
            dataObject.panDocument = uploadResult.url;
            dataObject.panDocumentKey = uploadResult.key;
        }
        //  else if (panNumber) {
        //     return res.status(statusCode.BadRequest).send({
        //         message: 'PAN document is required if PAN number is updated.',
        //     });
        // }

        const updatedBusinessUnit = await businessUnitService.update(clientId, businessUnitId, dataObject);
        return res.status(statusCode.OK).send({
            message: 'Business Unit updated successfully.',
            data: { businessUnitId: updatedBusinessUnit._id },
        });
    } catch (error) {
        next(error)
    }
};

// get particular business unit by vendor
exports.getParticularBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnitId } = req.params;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        const businessUnit = await businessUnitService.getById(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBusinessUnitFoundSuccessfully,
            data: businessUnit,
        });
    } catch (error) {
        next(error)
    }
};

// list business unit by vendor
exports.listBusinessUnit = async (req, res, next) => {
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
        const result = await businessUnitService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblChairFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get ActiveBusinessUnit
exports.getActiveBusinessUnit = async (req, res, next) => {
    try {
        const { clientId } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const result = await businessUnitService.getAllActive(clientId);
        return res.status(statusCode.OK).send({
            message: message.lblBusinessUnitFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// refre master group for business unit
exports.refreshMasterGroupForBusinessUnit = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { businessUnitId, clientId } = req.body;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const LedgerGroup = clientConnection.model("ledgerGroup", clientLedgerGroupSchema);

        const existingLedgerGroupMaster = await LedgerGroup.findOne({ businessUnit: businessUnitId, isBuLevel: true, groupName: "Capital Account" });
        if (!existingLedgerGroupMaster) {
            await generateLedgerGroup(businessUnitId, null, null, "business", mainUser, clientId);
        }

        const VoucherGroup = clientConnection.model("voucherGroup", clientVoucharGroupSchema);
        const existingVoucherGroupMaster = await VoucherGroup.findOne({ businessUnit: businessUnitId, isBuLevel: true, name: "Payment" });
        if (!existingVoucherGroupMaster) {
            await generateVoucherGroup(businessUnitId, null, null, "business", mainUser, clientId);
        }


        return res.status(statusCode.OK).send({
            message: "Group refreshed Successfully"
        })
    } catch (error) {
        next(error);
    }
};

// active inactive business unit by vendor
exports.activeinactiveBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        const updatedChair = await businessUnitService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listBusinessUnit(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete business unit by vendor
exports.softDeleteBusinesssUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, businessUnitId, clientId } = req.body;
        console.log("req.body", req.body);
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await businessUnitService.deleted(clientId, businessUnitId, softDelete = true)
        this.listBusinessUnit(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Business unit
exports.restoreBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, businessUnitId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await businessUnitService.restore(clientId, businessUnitId)
        this.listBusinessUnit(req, res, next);
    } catch (error) {
        next(error)
    }
};





