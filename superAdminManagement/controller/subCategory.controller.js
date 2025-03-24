


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const subCategoryService = require("../services/subCategory.service")

// create subCategory by superAdmin
exports.createSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { categoryId, name, description, slug } = req.body;
        const mainUser = req.user;

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
            categoryId : categoryId,
            createdBy: mainUser._id,
        }
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename

            }
        }
        const newSubCategory = await subCategoryService.create({ ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblSubCategoryCreatedSuccess,
            data: { categoryId: newSubCategory._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  subCategory by superAdmin
exports.updateSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { subCategoryId, name, description, slug } = req.body;
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
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
        const updated = await subCategoryService.update(subCategoryId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblSubCategoryUpdatedSuccess,
            data: { subCategoryId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular subCategory by superAdmin
exports.getParticularSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { subCategoryId } = req.params;
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        const subCategory = await subCategoryService.getById(subCategoryId);
        return res.status(200).send({
            message: message.lblSubCategoryFoundSuccessfully,
            data: subCategory,
        });
    } catch (error) {
        next(error)
    }
};

// list subCategory by superAdmin
exports.listSubCategory = async (req, res, next) => {
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
        const result = await subCategoryService.list( filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblSubCategoryFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive subCategory by superAdmin
exports.activeinactiveSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!id) {
            return res.status(400).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        await subCategoryService.activeInactive( id, {
            isActive: status === "1",
        });
        this.listSubCategory(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete subCategory by superAdmin
exports.softDeleteSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, subCategoryId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        await subCategoryService.deleted(subCategoryId, softDelete = true)
        this.listSubCategory(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore subCategory
exports.restoreSubCategoryBySuperAdmin = async (req, res, next) => {
    try {
        const { keyword, page, perPage, subCategoryId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        await subCategoryService.restore(subCategoryId)
        this.listSubCategory(req, res, next);
    } catch (error) {
        next(error)
    }
};





