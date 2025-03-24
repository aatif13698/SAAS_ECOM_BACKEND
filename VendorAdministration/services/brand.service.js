// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBrandSchema = require("../../client/model/brand")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");




const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const existing = await Brand.findOne({
            $or: [{ name: data.name }],
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblBrandAlreadyExists);
        }
        return await Brand.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating brand: ${error.message}`);
    }
};

const update = async (clientId, brandId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const brand = await Brand.findById(brandId);
        if (!brand) {
            throw new CustomError(statusCode.NotFound, message.lblCategoryNotFound);
        }
        if (data.name && data.name !== brand.name) {
            const conflict = await Brand.exists({
                _id: { $ne: brandId },
                name: data.name,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblBrandAlreadyExists);
            }
        }
        Object.assign(brand, data);
        return await brand.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating brand: ${error.message}`);
    }
};

const getById = async (brandId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const brand = await Brand.findById(brandId);
        if (!brand) {
            throw new CustomError(statusCode.NotFound, message.lblBrandNotFound);
        }
        return brand;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting brand: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [brands, total] = await Promise.all([
            Brand.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            Brand.countDocuments(filters),
        ]);
        return { count: total, brands };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing brand: ${error.message}`);
    }
};


const getActive = async (clientId, filters = {}) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const [brands] = await Promise.all([
            Brand.find(filters).sort({ _id: -1 }),
        ]);
        return { brands };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing brand: ${error.message}`);
    }
};

const activeInactive = async (clientId, brandId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const brand = await Brand.findById(brandId);
        if (!brand) {
            throw new CustomError(statusCode.NotFound, message.lblBrandNotFound);
        }
        Object.assign(brand, data);
        return await brand.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive brand: ${error.message}`);
    }
};

const deleted = async (clientId,brandId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const brand = await Brand.findById(brandId);
        if (!brand) {
            throw new CustomError(statusCode.NotFound, message.lblBrandNotFound);
        }
        if (softDelete) {
            brand.deletedAt = new Date();
            await brand.save();
        } else {
            await brand.remove();
        }
        return brand;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete brand: ${error.message}`);
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
