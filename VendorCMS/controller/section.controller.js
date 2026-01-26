



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const sectionService = require("../service/section.service");
const bcrypt = require("bcrypt");
const clientCustomFieldSchema = require("../../client/model/customField");
const { default: mongoose } = require("mongoose");



// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            template,
            type,
            title,
            products,
        } = req.body;

        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            template,
            type,
            title,
            products,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            template,
            type,
            title,
            products,
            createdBy: mainUser._id,
        };
        const newSection = await sectionService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: "Section created successfully",
            data: { newSection },
        });
    } catch (error) {
        next(error);
    }
};

// list
exports.list = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
        console.log("req.query", req.query);
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
        };
        const result = await sectionService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: "Statement found successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};



// active inactive
exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblFinancialYearIdAndClientIdRequired,
            });
        }
        const updated = await sectionService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {
    try {
        const {
            clientId,
            statementId,
            title,
            description,
            type,
        } = req.body;




        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            title,
            description,
            type,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            title,
            description,
            type,
        };

        // update 
        const updated = await sectionService.update(clientId, statementId, dataObject);
        return res.status(statusCode.OK).send({
            message: "Statement updated successfully",
        });
    } catch (error) {
        next(error);
    }

};





exports.sectionTypes = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }

        const result = await sectionService.sectionType(clientId);
        return res.status(statusCode.OK).send({
            message: "Section found success.",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};





































// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, shiftId } = req.params;
        if (!clientId || !shiftId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const shift = await sectionService.getById(clientId, shiftId);
        return res.status(200).send({
            message: message.lblShiftFoundSucessfully,
            data: employee,
        });
    } catch (error) {
        next(error)
    }
};






















































