// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetSubCategorySchema = require("../../client/model/subCategory")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetCategorySchema = require("../../client/model/category");


const allActiveCategory = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const category = await Category.find({
            isActive: true,
            deletedAt: null
        });
        if (!category) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        return category;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting category: ${error.message}`);
    }
};


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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

const update = async (clientId, subCategoryId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        return subCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting subCategory: ${error.message}`);
    }
};

const subcategoryByCategory = async (clientId,categoryId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const subCategory = await SubCategory.find({categoryId : categoryId});
        if (!subCategory) {
            throw new CustomError(statusCode.NotFound, message.lblSubCategoryNotFound);
        }
        return subCategory;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting subCategory: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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

const activeInactive = async (clientId, subCategoryId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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

const deleted = async (clientId, subCategoryId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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

const restore = async (subCategoryId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
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
    allActiveCategory,
    create,
    update,
    getById,
    subcategoryByCategory,
    list,
    activeInactive,
    deleted,
    restore
};
