



const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const warehouseService = require("../services/warehouse.service")


// create warehouse by vendor
exports.createWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, businessUnit, branchId, name, incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address } = req.body;
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
            businessUnit, branchId,
            name, incorporationName,
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

        const newData = await warehouseService.create(clientId, { ...dataObject });
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseCreatedSuccess,
            data: { businessUnitId: newData._id },
        });
    } catch (error) {
        next(error)
    }
};

// update  warehouse by vendor
exports.updateWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, warehouseId, businessUnitId, branchId, name,incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address } = req.body;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        if (!name || !emailContact || !contactNumber || !city || !state || !country || !ZipCode || !address) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblRequiredFieldMissing,
            });
        }

        let dataObject = {
            businessUnitId,branchId, name,incorporationName, emailContact, contactNumber, city, state, country, ZipCode, address
        }

        if (req.file && req.file.filename) {
            dataObject = {
                ...dataObject,
                icon: req.file.filename

            }
        }

        const updated = await warehouseService.update(clientId, warehouseId, {...dataObject});
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseUpdatedSuccess,
            data: { warehouseId: updated._id },
        });
    } catch (error) {
        next(error);
    }
};

// get particular warehouse by vendor
exports.getParticularWarehouseByVendor = async (req, res, next) => {
    try {
        const { clientId, warehouseId } = req.params;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        const branch = await warehouseService.getById(clientId, warehouseId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};

// get warehouse by branch
exports.getWarehouseByBranch = async (req, res, next) => {
    try {
        const { clientId, branchId } = req.params;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const warehouse = await warehouseService.getByBranch(clientId, branchId);
        return res.status(200).send({
            message: message.lblWarehouseCreatedSuccess,
            data: warehouse,
        });
    } catch (error) {
        next(error)
    }
};


// list warehouse by vendor
exports.listWarehouse = async (req, res, next) => {
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
        const result = await warehouseService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblWarehouseFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactiveWarehouseByVendor = async (req, res, next) => {
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
        const updated = await warehouseService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.listWarehouse(req, res, next)
    } catch (error) {
        next(error);
    }
};



// Soft delete warehouse by vendor
exports.softDeleteWarehouseByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, warehouseId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdAndClientIdRequired,
            });
        }
        await warehouseService.deleted(clientId, warehouseId, softDelete = true)
        this.listWarehouse(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore warehouse by vendor
exports.restoreWarehouseByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, warehouseId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !warehouseId) {
            return res.status(400).send({
                message: message.lblWarehouseIdIdAndClientIdRequired,
            });
        }
        await warehouseService.restore(clientId, warehouseId)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error)
    }
};





