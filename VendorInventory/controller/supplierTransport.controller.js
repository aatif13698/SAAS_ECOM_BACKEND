



const customerAddressSchema = require("../../client/model/customerAddress");
const clientRoleSchema = require("../../client/model/role");
const supplierSchema = require("../../client/model/supplier");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const supplierTransportService = require("../services/supplierTransport.service");
const bcrypt = require("bcrypt")

// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            supplierId,
            transporterName,
            transporterGstin,
            transporterPan,
            country,
            state,
            city,
            transporterAddress,
            transporterContactPerson,
            transporterPhone,
            transporterEmail,
            transporterId,

        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            supplierId,
            clientId,
            transporterName,
            transporterGstin,
            transporterPan,
            transporterPhone,
            transporterEmail,
            transporterId,
        ];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            supplierId,
            transporterName,
            transporterGstin,
            transporterPan,
            country,
            state,
            city,
            transporterAddress,
            transporterContactPerson,
            transporterPhone,
            transporterEmail,
            transporterId,
            createdBy: mainUser._id
        };

        // Create 
        const created = await supplierTransportService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSupplierCreatedSuccess,
            data: { id: created._id },
        });
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {
    try {
        const {
            clientId,
            supplierId,
            transportId,
            transporterName,
            transporterGstin,
            transporterPan,
            transporterAddress,
            country,
            state,
            city,
            transporterContactPerson,
            transporterPhone,
            transporterEmail,
            transporterId,

        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            supplierId,
            clientId,
            transportId,
            transporterName,
            transporterGstin,
            transporterPan,
            transporterPhone,
            transporterEmail,
            transporterId,
        ];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            supplierId,
            transporterName,
            transporterGstin,
            transporterPan,
            transporterAddress,
            country,
            state,
            city,
            transporterContactPerson,
            transporterPhone,
            transporterEmail,
            transporterId,
            createdBy: mainUser._id
        };

        const updated = await supplierTransportService.update(clientId, transportId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSupplierTransportUpdatedSuccess,
            data: { id: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, transportId } = req.params;
        if (!clientId || !transportId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const transport = await supplierTransportService.getById(clientId, transportId);
        return res.status(200).send({
            message: message.lblSupplierTransportFoundSuccessfully,
            data: transport,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.list = async (req, res, next) => {
    try {
        const mainUser = req.user;
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
                    { transporterName: { $regex: keyword.trim(), $options: "i" } },
                    { transporterGstin: { $regex: keyword.trim(), $options: "i" } },
                    { transporterPan: { $regex: keyword.trim(), $options: "i" } },
                    { transporterAddress: { $regex: keyword.trim(), $options: "i" } },
                    { transporterPhone: { $regex: keyword.trim(), $options: "i" } },
                    { transporterEmail: { $regex: keyword.trim(), $options: "i" } },
                    { transporterId: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await supplierTransportService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblSupplierTransportFoundSuccessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblSupplierTransportUpdatedSuccess,
            });
        }
        const updated = await supplierTransportService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};
