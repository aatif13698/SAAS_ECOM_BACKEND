const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const purchaseOrderService = require("../services/purchaseOrder.service");
const bcrypt = require("bcrypt")


// create 
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,



            supplier,
            shippingAddress,
            poNumber,
            poDate,
            items,
            notes,
            bankDetails,
            isInterState,
            roundOff,
            paymentMethod,
            paidAmount,
            balance



        } = req.body;


        const mainUser = req.user;

        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            supplier,
            shippingAddress,
            poNumber,
            poDate,
            items,
            notes,
            bankDetails,
            paymentMethod,
            paidAmount,
            balance
        ];

        console.log("requiredFields", requiredFields);
        

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        console.log("coming here");
        

        if (items?.length == 0) {
            return res.status(statusCode.BadRequest).send({ message: "Items is required" })
        }

        // Base data object 
        const dataObject = {
            supplier,
            shippingAddress,
            poNumber,
            poDate,
            items,
            notes,
            bankDetails,
            isInterState,
            roundOff,
            paymentMethod,
            paidAmount,
            balance,
            createdBy: mainUser._id,
        };

        // Level-specific validation and assignment 
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level 
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        const newPurchaseOrder = await purchaseOrderService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblPurchaseOrderCreatedSuccess,
            data: { holidayId: newPurchaseOrder._id },
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
            holidayId,
            level,
            businessUnit,
            branch,
            warehouse,

            name,
            code,
            description,
            startDate,
            endDate,
            isHalfDay,
        } = req.body;

        const mainUser = req.user;
        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            name,
            code,
            description,
            startDate,
            endDate,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object 
        const dataObject = {
            name,
            code,
            description,
            startDate,
            endDate,
            isHalfDay,
            createdBy: mainUser._id,
        };

        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level 
        if (businessUnit && businessUnit !== "null") {
            dataObject.businessUnit = businessUnit;
        }
        if (branch && branch !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse && warehouse !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }
        // update  
        const updated = await purchaseOrderService.update(clientId, holidayId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblHolidayUpdatedSuccess,
        });
    } catch (error) {
        next(error);
    }

};

// get particular  
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, holidayId } = req.params;
        if (!clientId || !holidayId) {
            return res.status(400).send({
                message: message.lblHolidayIdIdAndClientIdRequired,
            });
        }
        const asset = await purchaseOrderService.getById(clientId, holidayId);
        return res.status(200).send({
            message: message.lblHolidayFoundSucessfully,
            data: asset,
        });
    } catch (error) {
        next(error)
    }
};

// list 
exports.list = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            ...(keyword && {
                $or: [
                    // { name: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };
        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true, 
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                // isBranchLevel: true, 
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true, 
                warehouse: levelId
            }
        }
        const result = await purchaseOrderService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblHolidayFoundSucessfully,
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
                message: message.lblHolidayIdIdAndClientIdRequired,
            });
        }
        const updated = await purchaseOrderService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
}; 