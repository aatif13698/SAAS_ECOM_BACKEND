


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const categoryService = require("../services/category.service")

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
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
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
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
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
        const result = await categoryService.list( filters, { page, limit: perPage });
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
            isActive : true
        };
        const result = await categoryService.getAllActive( filters);
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
        await categoryService.activeInactive( id, {
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





