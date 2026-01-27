



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const bannerService = require("../service/banner.service");
const bcrypt = require("bcrypt");
const clientCustomFieldSchema = require("../../client/model/customField");
const { default: mongoose } = require("mongoose");
const sectionSchema = require("../../client/model/section");
const productBlueprintSchema = require("../../client/model/productBlueprint");


const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
const bannerSchema = require("../../client/model/banner");
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
    const fileName = `saasEcommerce/${clientId}/manufacturers/${uuidv4()}${fileExtension}`;
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


exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            product,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            product,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            product,
            createdBy: mainUser._id,
        };

         if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.image = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }

        const newSection = await bannerService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: "Section created successfully",
            data: { newSection },
        });
    } catch (error) {
        next(error);
    }
};

// list
exports.list = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId } = req.query;
        console.log("req.query", req.query);
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
        };
        const result = await bannerService.list(clientId, filters);
        return res.status(statusCode.OK).send({
            message: "Banners found successfully",
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
        const updated = await bannerService.activeInactive(clientId, id, {
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
            product,
            id,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            product, id
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            product,
            createdBy: mainUser._id,
        };

         if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.image = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }

        const updatedBanner = await bannerService.update(clientId, id, dataObject);
        return res.status(statusCode.OK).send({
            message: "Banner created successfully",
            data: { updatedBanner },
        });
    } catch (error) {
        next(error);
    }
};





exports.sectionTypes = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        const result = await bannerService.sectionType(clientId);
        return res.status(statusCode.OK).send({
            message: "Section found success.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


exports.updateBannerOrders = async (req, res) => {
    try {
        const { updates, clientId } = req.body;

        console.log("updates", updates);
        
        console.log("clientId", clientId);
        

        const parsedUpdate = JSON.parse(updates)

        // Basic validation
        if (!Array.isArray(parsedUpdate) || parsedUpdate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Expected an array of { _id, order } objects.',
            });
        }

        // Optional: Validate that all orders are unique numbers
        const orderValues = parsedUpdate.map(u => u.order);
        const uniqueOrders = new Set(orderValues);
        if (uniqueOrders.size !== parsedUpdate.length) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate order values detected. All orders must be unique.',
            });
        }

        // Optional: Validate that orders are sequential starting from 1 (recommended)
        const sortedOrders = [...orderValues].sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i + 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Orders must be sequential integers starting from 1 (1, 2, 3, ...).',
                });
            }
        }

        // Prepare bulk operations
        const bulkOps = parsedUpdate.map(update => ({
            updateOne: {
                filter: {
                    _id: new mongoose.Types.ObjectId(update._id),
                    // Optional: Add createdBy filter for security if you have authentication
                    // createdBy: req.user._id  // Uncomment if you have req.user from auth middleware
                },
                update: {
                    $set: { order: update.order },
                },
                upsert: false,
            },
        }));

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Banner = clientConnection.model("banner", bannerSchema)
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        // Execute bulk write (atomic operation)
        const result = await Banner.bulkWrite(bulkOps, { ordered: true });

        // Check if all operations succeeded
        if (result.modifiedCount !== parsedUpdate.length) {
            return res.status(400).json({
                success: false,
                message: `Only ${result.modifiedCount} out of ${parsedUpdate.length} banners were updated. Some IDs may not exist.`,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Banner orders updated successfully',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error updating orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};



exports.bannerById = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId , id} = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const result = await bannerService.bannerById(clientId, id);
        return res.status(statusCode.OK).send({
            message: "Section found success.",
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
        const shift = await bannerService.getById(clientId, shiftId);
        return res.status(200).send({
            message: message.lblShiftFoundSucessfully,
            data: employee,
        });
    } catch (error) {
        next(error)
    }
};






















































