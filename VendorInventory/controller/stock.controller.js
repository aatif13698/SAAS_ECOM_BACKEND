



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const stockService = require("../services/stock.service");
const bcrypt = require("bcrypt");

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
            product,
            businessUnit,
            branch,
            warehouse,
            variant,
            varianValue,
            totalStock,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions


        } = req.body;
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            product,
            businessUnit,
            branch,
            warehouse,
            variant,
            varianValue,
            totalStock,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            product,
            businessUnit,
            branch,
            warehouse,
            variant,
            varianValue,
            totalStock,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions
        };

        // let attachments = [];
        // if (req.files && req.files.length > 0) {
        //     for (let index = 0; index < req.files.length; index++) {
        //         const element = req.files[index];
        //         attachments.push(element.filename)
        //     }
        //     dataObject.images = attachments;
        // }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadProductImageToS3(file, clientId);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }

        // Create 
        const created = await stockService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblStockCreatedSuccess,
            data: created,
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
            stockId,
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            // priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions

        } = req.body;



        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            // priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            product,
            businessUnit,
            branch,
            warehouse,
            totalStock,
            // priceOptions,
            onlineStock,
            offlineStock,
            lowStockThreshold,
            restockQuantity,
            name,
            description,
            specification,
            paymentOPtions
        };

        // let attachments = [];
        // if (req.files && req.files.length > 0) {
        //     for (let index = 0; index < req.files.length; index++) {
        //         const element = req.files[index];
        //         attachments.push(element.filename)
        //     }
        //     dataObject.images = attachments;
        // }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const uploadResult = await uploadProductImageToS3(file, clientId);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }

        const updated = await stockService.update(clientId, stockId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblStockUpdatedSuccess,
            data: updated,
        });
    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, stockId } = req.params;
        if (!clientId || !stockId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const data = await stockService.getById(clientId, stockId);
        return res.status(200).send({
            message: message.lblStockFoundSuccessfully,
            data: data,
        });
    } catch (error) {
        next(error)
    }
};

// get stock by product
exports.getStockByProduct = async (req, res, next) => {
    try {
        const { clientId, product } = req.params;
        if (!clientId || !product) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const data = await stockService.getByProduct(clientId, product);
        return res.status(200).send({
            message: message.lblStockFoundSuccessfully,
            data: data,
        });
    } catch (error) {
        next(error)
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
                    // { name: { $regex: keyword.trim(), $options: "i" } },
                    // { contactPerson: { $regex: keyword.trim(), $options: "i" } },
                    // { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    // { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                warehouse: levelId
            }
        }
        const result = await stockService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblStockFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get list stock
// exports.listStock = async (req, res, next) => {
//     try {

//         const mainUser = req.user;
//         const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "", categoryId = null, subCategoryId = null } = req.query;

//         if (!clientId) {
//             return res.status(statusCode.BadRequest).send({
//                 message: message.lblClinetIdIsRequired,
//             });
//         }
//         let filters = {
//             deletedAt: null,
//         };
//         const result = await stockService.getListStock(clientId, filters, { page, limit: perPage });
//         return res.status(statusCode.OK).send({
//             message: message.lblStockFoundSuccessfully,
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };
exports.listStock = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const {
            clientId,
            keyword = '',
            page: pageStr = '1',
            perPage: perPageStr = '10',
            level = "vendor",
            levelId = "",
            categoryId = null,
            subCategoryId = null
        } = req.query;


        if (!clientId) {
            return res.status(400).send({
                message: "Client ID is required",
            });
        }

        // Convert to numbers
        const page = parseInt(pageStr, 10);
        const perPage = parseInt(perPageStr, 10);

        if (isNaN(page) || isNaN(perPage) || page < 1 || perPage < 1) {
            return res.status(400).send({
                message: "Invalid pagination parameters",
            });
        }

        const result = await stockService.getListStock(
            clientId,
            keyword,
            categoryId,
            subCategoryId,
            level,
            levelId,
            { page, limit: perPage }
        );

        return res.status(200).send({
            message: "Stock found successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const updated = await stockService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete 
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, stockId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !stockId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        await stockService.deleted(clientId, stockId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};


// get all stock
exports.getAllStock = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId } = req.query;

        console.log("req.query", req.query);

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const filters = {
            deletedAt: null,
            onlineStock: { $ne: 0 },
            ...(keyword && {
                $or: [
                    // { name: { $regex: keyword.trim(), $options: "i" } },
                    // { contactPerson: { $regex: keyword.trim(), $options: "i" } },
                    // { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    // { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await stockService.getAllStock(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblStockFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};





