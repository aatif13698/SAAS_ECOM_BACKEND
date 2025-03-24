



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const businessUnitService = require("../../client/service/businessUnit.service")


// create business unit by vendor
exports.createBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, name, emailContact, contactNumber, tinNumber, businessLicenseNumber, city, state, country, ZipCode, address } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            name,
            emailContact,
            contactNumber, tinNumber, businessLicenseNumber,
            city, state, country, ZipCode, address,
            createdBy: mainUser._id,
        }

        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename

            }
        }

        const newBusinessUnit = await businessUnitService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBusinessUnitCreatedSuccess,
            data: { businessUnitId: newBusinessUnit._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  business unit by vendor
exports.updateBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnitId, name, emailContact, contactNumber, tinNumber, businessLicenseNumber, city, state, country, ZipCode, address } = req.body;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            name, emailContact, contactNumber, tinNumber, businessLicenseNumber, city, state, country, ZipCode, address
        }

        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
        }

        const updated = await businessUnitService.update(clientId, businessUnitId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBusinessUnitUpdatedSuccess,
            data: { businessUnitId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular business unit by vendor
exports.getParticularBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnitId } = req.params;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        const businessUnit = await businessUnitService.getById(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBusinessUnitFoundSuccessfully,
            data: businessUnit,
        });
    } catch (error) {
        next(error)
    }
};

// list business unit by vendor
exports.listBusinessUnit = async (req, res, next) => {
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
                    { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                    { city: { $regex: keyword.trim(), $options: "i" } },
                    { state: { $regex: keyword.trim(), $options: "i" } },
                    { country: { $regex: keyword.trim(), $options: "i" } },
                    { name: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await businessUnitService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblChairFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// get ActiveBusinessUnit
exports.getActiveBusinessUnit = async (req, res, next) => {
    try {
        const { clientId } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const result = await businessUnitService.getAllActive(clientId);
        return res.status(statusCode.OK).send({
            message: message.lblBusinessUnitFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive business unit by vendor
exports.activeinactiveBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        const updatedChair = await businessUnitService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listBusinessUnit(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete business unit by vendor
exports.softDeleteBusinesssUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, businessUnitId, clientId } = req.body;
        console.log("req.body",req.body);
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await businessUnitService.deleted(clientId, businessUnitId, softDelete = true)
        this.listBusinessUnit(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Business unit
exports.restoreBusinessUnitByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, businessUnitId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await businessUnitService.restore(clientId, businessUnitId)
        this.listBusinessUnit(req, res, next);
    } catch (error) {
        next(error)
    }
};





