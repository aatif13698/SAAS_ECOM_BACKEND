



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const warehouseService = require("../services/warehouse.service");



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
const uploadIconToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/warehouse/${uuidv4()}${fileExtension}`;
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



// create warehouse by vendor
exports.createWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnit, branchId, name, emailContact, contactNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            businessUnit, branchId,
            name,
            emailContact,
            contactNumber,
            city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark,
            createdBy: mainUser._id,
        }
        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }
        const newData = await warehouseService.create(clientId, { ...dataObject }, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseCreatedSuccess,
            data: { businessUnitId: newData._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  warehouse by vendor
exports.updateWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, warehouseId, businessUnitId, branchId, name, emailContact, contactNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark } = req.body;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            businessUnitId, branchId, name, emailContact, contactNumber, city, state, country, ZipCode, address, houseOrFlat, streetOrLocality, landmark
        }

        // if (req.file && req.file.filename) {
        //     dataObject = {
        //         ...dataObject,
        //         icon: req.file.filename

        //     }
        // }

        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }


        const updated = await warehouseService.update(clientId, warehouseId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseUpdatedSuccess,
            data: { warehouseId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular warehouse by vendor
exports.getParticularWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, warehouseId } = req.params;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        const branch = await warehouseService.getById(clientId, warehouseId);
        return res.status(200).send({
            message: message.lblWarehouseFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};

// get warehouse by branch
exports.getWarehouseByBranch = async (req, res, next) => {
    try {
        const { clientId, branchId } = req.params;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const warehouse = await warehouseService.getByBranch(clientId, branchId);
        return res.status(200).send({
            message: message.lblWarehouseCreatedSuccess,
            data: warehouse,
        });
    } catch (error) {
        next(error)
    }
};


// list warehouse by vendor
exports.listWarehouse = async (req, res, next) => {
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
        const result = await warehouseService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactiveWarehouseByVendor = async (req, res, next) => {
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
        const updated = await warehouseService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listWarehouse(req, res, next)
    } catch (error) {
        next(error);
    }
};



// Soft delete warehouse by vendor
exports.softDeleteWarehouseByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, warehouseId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdAndClientIdRequired,
            });
        }
        await warehouseService.deleted(clientId, warehouseId, softDelete = true)
        this.listWarehouse(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore warehouse by vendor
exports.restoreWarehouseByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, warehouseId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        await warehouseService.restore(clientId, warehouseId)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error)
    }
};





