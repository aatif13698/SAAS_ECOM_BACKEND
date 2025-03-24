// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");


const SubCategory = require("../../model/subCategory")


const create = async (data) => {
    try {
        const existing = await SubCategory.findOne({
            $or: [{ name: data.name }],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblSubCategoryAlreadyExists);
        }
        return await SubCategory.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating subCategory: ${error.message}`);
    }
};

const update = async (subCategoryId, data) => {
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        if (data.name && data.name !== subCategory.name) {
            const conflict = await SubCategory.exists({
                _id: { $ne: subCategoryId },
                name: data.name,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblSubCategoryAlreadyExists);
            }
        }
        Object.assign(subCategory, data);
        return await subCategory.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating subCategory: ${error.message}`);
    }
};

const getById = async (subCategoryId) => {
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        return subCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting subCategory: ${error.message}`);
    }
};

const list = async (filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [subCategories, total] = await Promise.all([
            SubCategory.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            SubCategory.countDocuments(filters),
        ]);
        return { count: total, subCategories };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing subCategory: ${error.message}`);
    }
};

const activeInactive = async (subCategoryId, data) => {
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        Object.assign(subCategory, data);
        return await subCategory.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive subCategory: ${error.message}`);
    }
};

const deleted = async ( subCategoryId, softDelete = true) => {
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        if (softDelete) {
            subCategory.deletedAt = new Date();
            await subCategory.save();
        } else {
            await subCategory.remove();
        }
        return subCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete subCategory: ${error.message}`);
    }
};

const restore = async ( subCategoryId) => {
    try {
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        subCategory.deletedAt = null;
        await subCategory.save();
        return subCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete subCategory: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,
    restore
};
