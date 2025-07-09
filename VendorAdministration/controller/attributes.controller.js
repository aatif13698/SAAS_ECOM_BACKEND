



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const attributeService = require("../services/attributes.service")


// create
exports.createAttributes = async (req, res, next) => {
    try {
        const { clientId, categoryId, subCategoryId, attributes } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        if (attributes?.length == 0) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const created = await attributeService.create(clientId, {
            categoryId, subCategoryId, attributes,
            createdBy: mainUser._id,
        });
        return res.status(statusCode.OK).send({
            message: message.lblAttributeCreatedSuccess,
            data: { attributesId: created._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  
exports.updateAttributes = async (req, res, next) => {
    try {
        const { clientId, attributesId, categoryId, subCategoryId, name, description, values } = req.body;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!categoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblCategoryIdIsRequired,
            });
        }
        if (!subCategoryId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblSubCategoryIdIsRequired,
            });
        }
        if (!name || !description || !values) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const updated = await attributeService.update(clientId, attributesId, {
            categoryId, subCategoryId, name, description, values
        });
        return res.status(statusCode.OK).send({
            message: message.lblAttributeUpdatedSuccess,
            data: { attributesId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular 
exports.getParticularAttributes = async (req, res, next) => {
    try {
        const { clientId, attributesId } = req.params;
        if (!clientId || !attributesId) {
            return res.status(400).send({
                message: message.lblAttributeIdIdAndClientIdRequired,
            });
        }
        const attribute = await attributeService.getById(clientId, attributesId);
        return res.status(200).send({
            message: message.lblAttributeFoundSuccessfully,
            data: attribute,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.listAttributes = async (req, res, next) => {
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
                ],
            }),
        };
        const result = await attributeService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblAttributeFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get active
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
        const result = await attributeService.getActive(clientId, filters);
        return res.status(statusCode.OK).send({
            message: message.lblAttributeFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive 
exports.activeinactiveAttributes = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblAttributeIdIdAndClientIdRequired,
            });
        }
        const updated = await attributeService.activeInactive(clientId, id, {
            isActive: status === "1",
        });
        this.listAttributes(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete 
exports.softDeleteAttributes = async (req, res, next) => {
    try {
        const { keyword, page, perPage, attributesId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !attributesId) {
            return res.status(400).send({
                message: message.lblAttributeIdIdAndClientIdRequired,
            });
        }
        await attributeService.deleted(clientId, attributesId, softDelete = true)
        this.listAttributes(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore 
exports.restoreAttributes = async (req, res, next) => {
    try {
        const { keyword, page, perPage, attributesId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !attributesId) {
            return res.status(400).send({
                message: message.lblAttributeIdIdAndClientIdRequired,
            });
        }
        await attributeService.restore(clientId, attributesId)
        this.listAttributes(req, res, next);
    } catch (error) {
        next(error)
    }
};





