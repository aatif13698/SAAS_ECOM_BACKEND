


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");

const productRateService = require("../services/productRate.service")

// create brand by vendor
exports.create = async (req, res, next) => {
    try {
        const { clientId, product, variant, price } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!product || !variant || !price) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            product: product,
            variant: variant,
            price: price,
            createdBy: mainUser._id,
        }

        const newdata = await productRateService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductRateCreatedSuccess,
            data: { productId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  brand by vendor
exports.update = async (req, res, next) => {
    try {
        const { clientId, productRateId, variant, price } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!productRateId || !variant || !price) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            variant: variant,
            price: price,
            createdBy: mainUser._id,
        }

        const newdata = await productRateService.update(clientId, productRateId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblProductRateUpdatedSuccess,
            data: { productId: newdata._id },
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
        const productRate = await productRateService.getById(clientId, productRateId);
        return res.status(200).send({
            message: message.lblProductRateFoundSuccessfully,
            data: productRate,
        });
    } catch (error) {
        next(error)
    }
};

// get rate by product
exports.getRateByProduct = async (req, res, next) => {
    try {
        const { productId, clientId } = req.params;
        if (!productId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblProductBlueprintIdIsRequired,
            });
        }
        const productRate = await productRateService.getByProductId(clientId, productId);
        return res.status(200).send({
            message: message.lblProductRateFoundSuccessfully,
            data: productRate,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.list = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;

        const filters = {
            deletedAt: null,
        };

        // Pass keyword to the service function
        const result = await productRateService.list(clientId, filters, { page, limit: perPage }, keyword);

        return res.status(statusCode.OK).send({
            message: message.lblProductRateFoundSuccessfully,
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
        await productRateService.deleted(clientId, productRateId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};
