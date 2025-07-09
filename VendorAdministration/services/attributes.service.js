// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const attributesSchema = require("../../client/model/attributes")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clinetSubCategorySchema = require("../../client/model/subCategory");
const clinetCategorySchema = require("../../client/model/category");
const productBlueprintSchema = require("../../client/model/productBlueprint");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const existing = await Attribute.findOne({
            productId: data.productId,
        });
        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblAttributeAlreadyExists);
        }
        return await Attribute.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating attribute: ${error.message}`);
    }
};

const update = async (clientId, attributeId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attributes = await Attribute.findById(attributeId);
        if (!attributes) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        if (data.name && data.name !== attributes.name) {
            const conflict = await Attribute.exists({
                _id: { $ne: attributeId },
                productId: data.productId,
            });
            if (conflict) {
                throw new CustomError(statusCode.Conflict, message.lblAttributeAlreadyExists);
            }
        }
        Object.assign(attributes, data);
        return await attributes.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating attribute: ${error.message}`);
    }
};

const getById = async (clientId, attributeId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attribute = await Attribute.findById(attributeId);
        if (!attribute) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        return attribute;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting attribute: ${error.message}`);
    }
};



const getByProduct = async (clientId, productId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attribute = await Attribute.findOne({productId: productId});
        if (!attribute) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        return attribute;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting attribute: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [attributes, total] = await Promise.all([
            Attribute.find(filters).skip(skip).limit(limit).sort({ _id: -1 })
                .populate({
                    path: "productId",
                    model: ProductBluePrint,
                })
               
            ,
            Attribute.countDocuments(filters),
        ]);

        return { count: total, attributes };

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing attribute: ${error.message}`);

    }
};


const getActive = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);

        const [attributes] = await Promise.all([
            Attribute.find(filters).sort({ _id: -1 }),
        ]);

        return { attributes };

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing attribute: ${error.message}`);

    }
};

const activeInactive = async (clientId, attributeId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attribute = await Attribute.findById(attributeId);
        if (!attribute) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        Object.assign(attribute, data);
        return await attribute.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive attribute: ${error.message}`);
    }
};

const deleted = async (clientId, attributeId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attribute = await Attribute.findById(attributeId);
        if (!attribute) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        if (softDelete) {
            attribute.deletedAt = new Date();
            await attribute.save();
        } else {
            await attribute.remove();
        }
        return attribute;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete attribute: ${error.message}`);
    }
};

const restore = async (clientId, attributeId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Attribute = clientConnection.model('attributes', attributesSchema);
        const attribute = await Attribute.findById(attributeId);
        if (!attribute) {
            throw new CustomError(statusCode.NotFound, message.lblAttributeNotFound);
        }
        attribute.deletedAt = null;
        await attribute.save();
        return attribute;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete attribute: ${error.message}`);
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
    restore,
    getByProduct
};
