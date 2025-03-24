


const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const manufacturerService = require("../services/manufactuer.service")

// create manufacturer by vendor
exports.create = async (req, res, next) => {
    try {
        const { clientId, name, description, slug, email, phone, url, country, } = req.body;
        const mainUser = req.user;

        if (!name || !description || !slug || !email || !phone || !url || !country) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            name, description, slug,
            email, phone, url, country,
            createdBy: mainUser._id,
        }
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
        }
        const newdata = await manufacturerService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblManufacturerCreatedSuccess,
            data: { categoryId: newdata._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  manufacturer by vendor
exports.update = async (req, res, next) => {
    try {
        const { clientId, manufacturerId, name, description, slug, email, phone, url, country, } = req.body;
        if (!manufacturerId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblManufacturerIdIsRequired,
            });
        }
        if (!name || !description || !slug || !email || !phone || !url || !country) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        let dataObject = {
            name, description, slug, email, phone, url, country,
        }
        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
        }
        const updated = await manufacturerService.update(clientId, manufacturerId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblManufacturerUpdatedSuccess,
            data: { manufacturerId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular manufacturer by vendor
exports.getParticulae = async (req, res, next) => {
    try {
        const { clientId, manufacturerId } = req.params;
        if (!manufacturerId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblManufacturerIdIsRequired,
            });
        }
        const manufactuer = await manufacturerService.getById(clientId, manufacturerId);
        return res.status(200).send({
            message: message.lblManufacturerFoundSuccessfully,
            data: manufactuer,
        });
    } catch (error) {
        next(error)
    }
};

// list manufacturer by vendor
exports.list = async (req, res, next) => {
    try {
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
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
        const result = await manufacturerService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblManufacturerFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get active manufacturer
exports.getActive = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const filters = {
            deletedAt: null,
            isActive: true
        };
        const result = await manufacturerService.getActive(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblManufacturerFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive manufacturer by vendor
exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!id) {
            return res.status(400).send({
                message: message.lblManufacturerIdIsRequired,
            });
        }
        await manufacturerService.activeInactive(clientId, id, {
            isActive: status === "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete manufacturer by vendor
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, manufacturerId, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!manufacturerId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblManufacturerIdIsRequired,
            });
        }
        await manufacturerService.deleted(clientId, manufacturerId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};
