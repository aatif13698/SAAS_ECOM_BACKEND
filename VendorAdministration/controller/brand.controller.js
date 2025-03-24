


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const brandService = require("../services/brand.service")

// create brand by vendor
exports.create = async (req, res, next) => {
    try {
        const { clientId, name, description, slug } = req.body;
        const mainUser = req.user;

        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        if (!name || !description || !slug) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            name, description, slug,
            createdBy: mainUser._id,
        }
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename

            }
        }
        const newdata = await brandService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBrandCreatedSuccess,
            data: { categoryId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  brand by vendor
exports.update = async (req, res, next) => {
    try {
        const { clientId, brandId, name, description, slug } = req.body;
        if (!brandId || !clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
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
        const updated = await brandService.update(clientId, brandId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBrandUpdatedSuccess,
            data: { brandId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular brand by vendor
exports.getParticulae = async (req, res, next) => {
    try {
        const { brandId } = req.params;
        if (!brandId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblBrandIdIsRequired,
            });
        }
        const brand = await brandService.getById(brandId);
        return res.status(200).send({
            message: message.lblBrandFoundSuccessfully,
            data: brand,
        });
    } catch (error) {
        next(error)
    }
};

// list brand by vendor
exports.list = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
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
        const result = await brandService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblBrandFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get active brands
exports.getActive = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        const filters = {
            deletedAt: null,
            isActive: true
        };
        const result = await brandService.getActive(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblBrandFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive brand by vendor
exports.activeinactive = async (req, res, next) => {
    try {
        const { clientId, keyword, page, perPage, id, status } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!id) {
            return res.status(400).send({
                message: message.lblBrandIdIsRequired,
            });
        }
        await brandService.activeInactive(clientId, id, {
            isActive: status === "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete brand by vendor
exports.softDelete = async (req, res, next) => {
    try {
        const {clientId, keyword, page, perPage, brandId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!brandId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblBrandIdIsRequired,
            });
        }
        await brandService.deleted(clientId, brandId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};
