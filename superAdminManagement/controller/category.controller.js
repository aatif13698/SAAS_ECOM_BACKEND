


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const categoryService = require("../services/category.service");

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
const uploadIconToS3 = async (file) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/category/${uuidv4()}${fileExtension}`;
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


// create Category by superAdmin
exports.createCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { name, description, slug } = req.body;
        const mainUser = req.user;
        if (!name || !description || !slug) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            name, description, slug,
            createdBy: mainUser._id,
        }
        // if (req.file && req.file.filename) {
        //     dataObject = {
        //         ...dataObject,
        //         icon: req.file.filename
        //     }
        // }
        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file);
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }
        const newCategory = await categoryService.create({ ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblCategoryCreatedSuccess,
            data: { categoryId: newCategory._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  Category by superAdmin
exports.updateCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { categoryId, name, description, slug } = req.body;
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        if (!name || !description || !slug) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            name, description, slug,
        }
        // if (req.file && req.file.filename) {
        //     dataObject = {
        //         ...dataObject,
        //         icon: req.file.filename
        //     }
        // }
        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file);
            dataObject.icon = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }
        const updated = await categoryService.update(categoryId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblCategoryUpdatedSuccess,
            data: { categoryId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular Category by superAdmin
exports.getParticularCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        const category = await categoryService.getById(categoryId);
        return res.status(200).send({
            message: message.lblCategoryFoundSuccessfully,
            data: category,
        });
    } catch (error) {
        next(error)
    }
};

// list Category by superAdmin
exports.listCategory = async (req, res, next) => {
    try {
        const { keyword = '', page = 1, perPage = 10 } = req.query;

        const filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    { name: { $regex: keyword.trim(), $options: "i" } },
                    { description: { $regex: keyword.trim(), $options: "i" } },
                    { slug: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await categoryService.list(filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblCategoryFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.allActiveCategory = async (req, res, next) => {
    try {
        const filters = {
            deletedAt: null,
            isActive: true
        };
        const result = await categoryService.getAllActive(filters);
        return res.status(statusCode.OK).send({
            message: message.lblCategoryFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive Category by superAdmin
exports.activeinactiveCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!id) {
            return res.status(400).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        await categoryService.activeInactive(id, {
            isActive: status === "1",
        });
        this.listCategory(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete Category by superAdmin
exports.softDeleteCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, categoryId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        await categoryService.deleted(categoryId, softDelete = true)
        this.listCategory(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Category
exports.restoreCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, categoryId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        await categoryService.restore(categoryId)
        this.listCategory(req, res, next);
    } catch (error) {
        next(error)
    }
};





