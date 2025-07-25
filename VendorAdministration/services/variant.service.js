// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBrandSchema = require("../../client/model/brand");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const productBlueprintSchema = require("../../client/model/productBlueprint");
const productRateSchema = require("../../client/model/productRate");
const clinetCategorySchema = require("../../client/model/category");
const productVariantSchema = require("../../client/model/productVariant");




const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
        const productVariant = await ProductVariant.findOne({ product: data.product, variant: data.variant });
        if (productVariant) {
            throw new CustomError(statusCode.NotFound, message.lblProductVariantAlreadyExists);
        }
        return await ProductVariant.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating : ${error.message}`);
    }
};

const update = async (clientId, variantId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
        const variantConflict = await ProductVariant.findOne({
            _id: { $ne: variantId },
            product: data.product,
            variant: data.variant,
        });
        if (variantConflict) {
            throw new CustomError(statusCode.NotFound, message.lblProductVariantAlreadyExists);
        }
        const vari = await ProductVariant.findById(variantId);
        Object.assign(vari, data);
        return await vari.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating : ${error.message}`);
    }
};

const getById = async (clientId, productRateId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const productRate = await ProductRate.findById(productRateId);
        if (!productRate) {
            throw new CustomError(statusCode.NotFound, message.lblProductRateNotFound);
        }
        return productRate;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const getByProductId = async (clientId, productId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);
        

        const productVariant = await ProductVariant.find({ product: productId, priceId: { $ne: null }  }).populate({
            path: "priceId",
            model : ProductRate
        });
        if (!productVariant) {
            throw new CustomError(statusCode.NotFound, message.lblProductVariantNotFound);
        }
        return productVariant;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const getAllByProductId = async (clientId, productId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);

        const productVariant = await ProductVariant.find({ product: productId  });
        if (!productVariant) {
            throw new CustomError(statusCode.NotFound, message.lblProductVariantNotFound);
        }
        return productVariant;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }, keyword = '') => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);
        const Category = clientConnection.model('clientCategory', clinetCategorySchema);
        const ProductVariant = clientConnection.model('productVariant', productVariantSchema);


        const { page, limit } = options;
        const skip = (page - 1) * limit;

        let query = { ...filters };

        // If a search keyword is provided, filter productRates by product name
        if (keyword) {
            // First, find matching products by name
            const matchingProducts = await ProductBluePrint.find({
                name: { $regex: keyword, $options: 'i' } // Case-insensitive search
            }).select('_id');

            const productIds = matchingProducts.map(prod => prod._id);

            // Add to filter
            query.product = { $in: productIds };
        }

        const [productVariant, total] = await Promise.all([
            ProductVariant.find(query)
                .skip(skip)
                .limit(limit)
                .sort({ _id: -1 })
                .populate({
                    path: 'product',
                    select: 'name _id categoryId',
                    model: ProductBluePrint,
                    populate: {
                        model: Category,
                        path: 'categoryId',
                        select: 'name _id', // Selecting only necessary fields from category
                    }
                }),
            ProductVariant.countDocuments(filters),
        ]);

        console.log("productVariant", productVariant);


        return { count: total, productVariant };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const deleted = async (clientId, productRateId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Brand = clientConnection.model('brand', clinetBrandSchema);
        const ProductRate = clientConnection.model('productRate', productRateSchema);

        const productRate = await ProductRate.findById(productRateId);
        if (!productRate) {
            throw new CustomError(statusCode.NotFound, message.lblProductRateNotFound);
        }
        if (softDelete) {
            productRate.deletedAt = new Date();
            await productRate.save();
        } else {
            await productRate.remove();
        }
        return productRate;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    getByProductId,
    getAllByProductId,
    list,
    deleted,
};
