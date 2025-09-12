


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const productBluePrintService = require("../services/productBluePrint.service");

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
    const fileName = `saasEcommerce/${clientId}/products/${uuidv4()}${fileExtension}`;
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



// create brand by vendor
exports.create = async (req, res, next) => {
    try {
        const { clientId, categoryId, subCategoryId, brandId, manufacturerId, name, description, taxRate, sku, isCustomizable, customizableOptions, } = req.body;
        const mainUser = req.user;

        console.log("req.body", req.body);


        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!categoryId || !subCategoryId || !brandId || !manufacturerId  || !name || !description || !sku || !isCustomizable) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            brandId: brandId,
            manufacturerId: manufacturerId,
            name, description, taxRate: Number(taxRate), sku, isCustomizable: isCustomizable == 'true' ? true : false,
            createdBy: mainUser._id,
        }

        if (customizableOptions && isCustomizable == 'true') {
            console.log("aaaa");
            dataObject = {
                ...dataObject,
                customizableOptions: JSON.parse(customizableOptions)
            }
        }

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
                const uploadResult = await uploadProductImageToS3(file);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }

        const newdata = await productBluePrintService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductBlueprintCreatedSuccess,
            data: { productId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};




// update  brand by vendor
exports.update = async (req, res, next) => {
    try {
        const { clientId, productBlueprintId, categoryId, subCategoryId, brandId, manufacturerId, name, description, taxRate, sku, isCustomizable, customizableOptions, } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!categoryId || !subCategoryId || !brandId || !manufacturerId || !name || !description || !sku || !isCustomizable) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            categoryId: categoryId,
            subCategoryId: subCategoryId,
            brandId: brandId,
            manufacturerId: manufacturerId,
            name, description, taxRate: Number(taxRate), sku, isCustomizable: isCustomizable == 'true' ? true : false,
            createdBy: mainUser._id,
        }
        if (customizableOptions && isCustomizable == 'true') {
            console.log("aaaa");
            dataObject = {
                ...dataObject,
                customizableOptions: JSON.parse(customizableOptions)
            }
        }
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
                const uploadResult = await uploadProductImageToS3(file);
                attachments.push(uploadResult.url);
            }
            dataObject.images = attachments;
        }
        const newdata = await productBluePrintService.update(clientId, productBlueprintId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductBlueprintUpdatedSuccess,
            data: { productId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// get particular 
exports.getParticulae = async (req, res, next) => {
    try {
        const { clientId, productBlueprintId } = req.params;
        if (!productBlueprintId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        const productBlueprint = await productBluePrintService.getById(clientId, productBlueprintId);
        return res.status(200).send({
            message: message.lblProductBlueprintFoundSuccessfully,
            data: productBlueprint,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.list = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        const filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { name: { $regex: keyword.trim(), $options: "i" } },
                    { description: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await productBluePrintService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblProductBlueprintFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get active 
exports.getActive = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const filters = {
            deletedAt: null,
            isActive : true
        };
        const result = await productBluePrintService.getActive(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblProductBlueprintFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive brand by vendor
exports.activeinactive = async (req, res, next) => {
    try {
        const { clientId, keyword, page, perPage, id, status } = req.body;
        console.log("status",status);
        
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!id) {
            return res.status(400).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        await productBluePrintService.activeInactive(clientId, id, {
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
        const { clientId, keyword, page, perPage, productBlueprintId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!productBlueprintId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        await productBluePrintService.deleted(clientId, productBlueprintId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};
