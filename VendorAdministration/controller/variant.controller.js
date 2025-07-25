



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const productVariantService = require("../services/variant.service")

// create 
exports.create = async (req, res, next) => {
    try {
        const { clientId, product, variant, stockEffect } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!product || !variant || !stockEffect) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            product: product,
            variant: variant,
            stockEffect: stockEffect,
            createdBy: mainUser._id,
        }

        const newdata = await productVariantService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductVariantCreatedSuccess,
            data: { productId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  brand by vendor
exports.update = async (req, res, next) => {
    try {
        const { clientId, variantId, product, variant, stockEffect } = req.body;

        console.log("req.body",req.body);
        
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!variantId || !variant || !stockEffect) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            product: product,
            variant: variant,
            stockEffect: stockEffect,
            createdBy: mainUser._id,
        }

        const newdata = await productVariantService.update(clientId, variantId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductVariantUpdatedSuccess,
            data: { variantId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { productRateId, clientId } = req.params;
        if (!productRateId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductRateIdIsRequired,
            });
        }
        const productRate = await productVariantService.getById(clientId, productRateId);
        return res.status(200).send({
            message: message.lblProductRateFoundSuccessfully,
            data: productRate,
        });
    } catch (error) {
        next(error)
    }
};

// get variant by product
exports.getVariantByProduct = async (req, res, next) => {
    try {
        const { productId, clientId } = req.params;
        console.log("req.params",req.params);
        
        if (!productId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        const productRate = await productVariantService.getByProductId(clientId, productId);
        return res.status(200).send({
            message: message.lblProductRateFoundSuccessfully,
            data: productRate,
        });
    } catch (error) {
        next(error)
    }
};

// get all variant by product id
exports.getAllVariantByProduct = async (req, res, next) => {
    try {
        const { productId, clientId } = req.params;
        console.log("req.params",req.params);
        
        if (!productId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        const productRate = await productVariantService.getAllByProductId(clientId, productId);
        return res.status(200).send({
            message: message.lblProductRateFoundSuccessfully,
            data: productRate,
        });
    } catch (error) {
        next(error)
    }
}

// list 
exports.list = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;

        const filters = {
            deletedAt: null,
        };

        // Pass keyword to the service function
        const result = await productVariantService.list(clientId, filters, { page, limit: perPage }, keyword);

        return res.status(statusCode.OK).send({
            message: message.lblProductVariantFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};



// Soft delete brand by vendor
exports.softDelete = async (req, res, next) => {
    try {
        const { clientId, keyword, page, perPage, productRateId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!productRateId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductRateIdIsRequired,
            });
        }
        await productVariantService.deleted(clientId, productRateId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};
