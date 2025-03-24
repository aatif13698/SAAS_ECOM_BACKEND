// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBrandSchema = require("../../client/model/brand");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const clinetSubCategorySchema = require("../../client/model/subCategory");
const clinetCategorySchema = require("../../client/model/category");




const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const existing = await ProductBluePrint.findOne({
            $or: [{ name: data.name }],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblProductBlueprintAlreadyExists);
        }
        return await ProductBluePrint.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, productBlueprintId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const productBlueprint = await ProductBluePrint.findById(productBlueprintId);
        if (!productBlueprint) {
            throw new CustomError(statusCode.NotFound, message.lblProductBlueprintNotFound);
        }
        if (data.name && data.name !== productBlueprint.name) {
            const conflict = await ProductBluePrint.exists({
                _id: { $ne: productBlueprintId },
                name: data.name,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblProductBlueprintAlreadyExists);
            }
        }
        Object.assign(productBlueprint, data);
        return await productBlueprint.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating : ${error.message}`);
    }
};

const getById = async (clientId, productBlueprintId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const productBlueprint = await ProductBluePrint.findById(productBlueprintId);
        if (!productBlueprint) {
            throw new CustomError(statusCode.NotFound, message.lblProductBlueprintNotFound);
        }
        return productBlueprint;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [roductBluePrints, total] = await Promise.all([
            ProductBluePrint.find(filters).skip(skip).limit(limit).sort({ _id: -1 }).populate({
                path: 'brandId',
                model: Brand,
                select: 'name _id'
            }).populate({
                path: 'subCategoryId',
                model: SubCategory,
                select: 'name _id'
            }).populate({
                path: 'categoryId',
                model: Category,
                select: 'name _id'
            }),
            ProductBluePrint.countDocuments(filters),
        ]);
        return { count: total, roductBluePrints };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const getActive = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const SubCategory = clientConnection.model('clientSubCategory', clinetSubCategorySchema);
        const [roductBluePrints] = await Promise.all([
            ProductBluePrint.find(filters).sort({ _id: -1 }).populate({
                path: 'brandId',
                model: Brand,
                select: 'name _id'
            }).populate({
                path: 'subCategoryId',
                model: SubCategory,
                select: 'name _id'
            }).populate({
                path: 'categoryId',
                model: Category,
                select: 'name _id'
            }),
        ]);
        return {roductBluePrints};
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};

const activeInactive = async (clientId, id, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const productBluePrint = await ProductBluePrint.findById(id);
        if (!productBluePrint) {
            throw new CustomError(statusCode.NotFound, message.lblProductBlueprintNotFound);
        }
        Object.assign(productBluePrint, data);
        return await productBluePrint.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};

const deleted = async (clientId,brandId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const productBluePrint = await ProductBluePrint.findById(brandId);
        if (!productBluePrint) {
            throw new CustomError(statusCode.NotFound, message.lblProductBlueprintNotFound);
        }
        if (softDelete) {
            productBluePrint.deletedAt = new Date();
            await productBluePrint.save();
        } else {
            await productBluePrint.remove();
        }
        return productBluePrint;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete product blueprint: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    getActive,
    activeInactive,
    deleted,
};
