



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const supplierService = require("../services/supplier.service");
const bcrypt = require("bcrypt")

// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,

            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,

            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,
            city,
            state,
            country,
            ZipCode,
            address,
        };

        // Create 
        const created = await supplierService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSubCategoryCreatedSuccess,
            data: { empId: created._id },
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

            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,

            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            name,
            contactPerson,
            emailContact,
            contactNumber,
            url,
            GstVanNumber,
            city,
            state,
            country,
            ZipCode,
            address,
        };

        // Create 
        const updated = await supplierService.update(clientId, supplierId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblSupplierUpdatedSuccess,
            data: { empId: updated._id },
        });
    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, supplierId } = req.params;
        if (!clientId || !supplierId) {
            return res.status(400).send({
                message: message.lblSupplierIdIdAndClientIdRequired,
            });
        }
        const supplier = await supplierService.getById(clientId, supplierId);
        return res.status(200).send({
            message: message.lblSupplierFoundSucessfully,
            data: supplier,
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
                    { name: { $regex: keyword.trim(), $options: "i" } },
                    { contactPerson: { $regex: keyword.trim(), $options: "i" } },
                    { emailContact: { $regex: keyword.trim(), $options: "i" } },
                    { contactNumber: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        const result = await supplierService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblSupplierFoundSucessfully,
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
                message: message.lblBranchIdAndClientIdRequired,
            });
        }
        const updated = await supplierService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listBranch(req, res, next)
    } catch (error) {
        next(error);
    }
};

// Soft delete 
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, supplierId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !supplierId) {
            return res.status(400).send({
                message: message.lblSupplierIdIdAndClientIdRequired,
            });
        }
        await supplierService.deleted(clientId, supplierId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};





