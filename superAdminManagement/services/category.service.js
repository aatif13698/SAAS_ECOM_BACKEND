// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");


const Category = require("../../model/category")


const create = async (data) => {
    try {
        const existing = await Category.findOne({
            $or: [{ name: data.name }],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblCategoryAlreadyExists);
        }
        return await Category.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating category: ${error.message}`);
    }
};

const update = async (categoryId, data) => {
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        if (data.name && data.name !== category.name) {
            const conflict = await Category.exists({
                _id: { $ne: categoryId },
                name: data.name,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblCategoryAlreadyExists);
            }
        }
        Object.assign(category, data);
        return await category.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating category: ${error.message}`);
    }
};

const getById = async (categoryId) => {
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        return category;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting category: ${error.message}`);
    }
};

const list = async (filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [categories, total] = await Promise.all([
            Category.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Category.countDocuments(filters),
        ]);
        return { count: total, categories };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing category: ${error.message}`);
    }
};

const activeInactive = async (categoryId, data) => {
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        Object.assign(category, data);
        return await category.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive category: ${error.message}`);
    }
};

const deleted = async ( categoryId, softDelete = true) => {
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        if (softDelete) {
            category.deletedAt = new Date();
            await category.save();
        } else {
            await category.remove();
        }
        return category;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete category: ${error.message}`);
    }
};

const restore = async ( categoryId) => {
    try {
        const category = await Category.findById(categoryId);
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        category.deletedAt = null;
        await category.save();
        return category;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete category: ${error.message}`);
    }
};


const getAllActive = async (filters = {}) => {
    try {
        const categories = await Category.find(filters);
        return {categories };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing category: ${error.message}`);
    }
};



module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,
    restore,
    getAllActive
};
