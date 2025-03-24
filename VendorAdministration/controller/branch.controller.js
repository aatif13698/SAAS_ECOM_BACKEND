



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const branchService = require("../services/branch.service")


// create Branch by vendor
exports.createBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnit, name, incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            businessUnit, name, incorporationName,
            emailContact,
            contactNumber,
            city, state, country, ZipCode, address,
            createdBy: mainUser._id,
        }

        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename

            }
        }

        const newBusinessUnit = await branchService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBranchCreatedSuccess,
            data: { businessUnitId: newBusinessUnit._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  Branch by vendor
exports.updateBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, branchId, businessUnit, name, incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address } = req.body;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdIdAndClientIdRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }


        let dataObject = {
            businessUnit, name,incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address
        }

        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename
            }
        }

        const updated = await branchService.update(clientId, branchId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblBranchUpdatedSuccess,
            data: { branchId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular Branch by vendor
exports.getParticularBranchByVendor = async (req, res, next) => {
    try {
        const { clientId, branchId } = req.params;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdIdAndClientIdRequired,
            });
        }
        const branch = await branchService.getById(clientId, branchId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};


// list Branch by vendor
exports.listBranch = async (req, res, next) => {
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
        const result = await branchService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblBranchFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactiveBranchByVendor = async (req, res, next) => {
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
        const updatedChair = await branchService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listBranch(req, res, next)
    } catch (error) {
        next(error);
    }
};




// Soft delete Branch by vendor
exports.softDeleteBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, branchId, clientId } = req.body;
        console.log("req.body",req.body);
        
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBranchIdAndClientIdRequired,
            });
        }
        await branchService.deleted(clientId, branchId, softDelete = true)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Branch by vendor
exports.restoreBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, branchId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await branchService.restore(clientId, branchId)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error)
    }
};



// get branch by business unit
exports.getBranchByBusinessUnit = async (req, res, next) => {
    try {
        const { clientId, businessUnitId } = req.params;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const branch = await branchService.getBranchByBusiness(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};




