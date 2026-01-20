const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const { sendPurchaseOrderEmail } = require("../../email/attachmentMail");
const { mailSender } = require("../../email/emailSend");
const { generatePurchaseOrderPDF } = require("../../helper/pdftGenerator");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const purchaseInvoice = require("../services/purchaseInvoice.service")
const bcrypt = require("bcrypt")


// create 
exports.create = async (req, res, next) => {
    const mainUser = req.user;
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,



            supplier,
            supplierLedger,
            shippingAddress,
            piNumber,
            piDate,
            items,
            notes,
            bankDetails,
            isInterState,
            roundOff,
            paymentMethod,
            payedFrom,
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
            supplierLedger,
            shippingAddress,
            piNumber,
            piDate,
            items,
            // notes,
            // bankDetails,
            // paymentMethod,
            // paidAmount,
            // balance
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
            supplierLedger,
            shippingAddress,
            piNumber,
            piDate,
            items,
            notes,
            bankDetails,
            isInterState,
            roundOff,
            paymentMethod,
            payedFrom,
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

        const newPurchaseOrder = await purchaseInvoice.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: message.lblPurchaseOrderCreatedSuccess,
            data: { holidayId: newPurchaseOrder._id },
        });
    } catch (error) {
        next(error);
    }
};

exports.getAuditPurchaseInvoice = async (req, res, next) => {
    try {
        const { clientId, purchaseOrderId } = req.params;
        if (!clientId || !purchaseOrderId) {
            return res.status(400).send({
                message: message.lblPurchaseOrderIdIdAndClientIdRequired,
            });
        }
        const auditPurchaseInvoice = await purchaseInvoice.getAuditPurchaseInvoice(clientId, purchaseOrderId);
        return res.status(200).send({
            message: "Invoice found successfully.",
            data: auditPurchaseInvoice,
        });
    } catch (error) {
        next(error)
    }
};


exports.auditItem = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, purchaseInvoiceId, productMainStock } = req.body;
        if (!clientId || !purchaseInvoiceId || !productMainStock) {
            return res.status(400).send({
                message: "Requird fields are missing.",
            });
        }
        const purchaseOrder = await purchaseInvoice.auditItem(clientId, purchaseInvoiceId, productMainStock, mainUser);

        return res.status(200).send({
            message: "Audit success.",
        });
    } catch (error) {
        next(error)
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
        const updated = await purchaseInvoice.update(clientId, holidayId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblHolidayUpdatedSuccess,
        });
    } catch (error) {
        next(error);
    }

};

exports.issueMail = async (req, res, next) => {
    try {
        const { clientId, purchaseOrderId } = req.body;
        if (!clientId || !purchaseOrderId) {
            return res.status(400).send({
                message: message.lblPurchaseOrderIdIdAndClientIdRequired,
            });
        }
        const purchaseOrder = await purchaseInvoice.getById(clientId, purchaseOrderId);

        if (!purchaseOrder?.supplier?.emailContact) {
            return res.status(statusCode.BadRequest).send({
                success: false,
                message: "Supplier email not found."
            })
        }
        // await sendPurchaseOrderEmail(purchaseOrder, purchaseOrder?.supplier?.emailContact, purchaseOrder?.supplier?.name);
        await sendPurchaseOrderEmail(purchaseOrder, "mdaatif3033@gmail.com", purchaseOrder?.supplier?.name);

        return res.status(200).send({
            message: "Mail sent successfully",
        });
    } catch (error) {
        next(error)
    }
};

// get particular  
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, purchaseOrderId } = req.params;
        if (!clientId || !purchaseOrderId) {
            return res.status(400).send({
                message: message.lblPurchaseOrderIdIdAndClientIdRequired,
            });
        }
        const asset = await purchaseInvoice.getById(clientId, purchaseOrderId);
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
                    { poNumber: { $regex: keyword.trim(), $options: "i" } },
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
        const result = await purchaseInvoice.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblHolidayFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.unpaidInvoices = async (req, res, next) => {
    try {
        const mainUser = req.user;
        const { clientId, level = "vendor", levelId = "", supplier, supplierLedger } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            supplier,
            supplierLedger,
        };
        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                isWarehouseLevel: true,
                warehouse: levelId
            }
        }
        const result = await purchaseInvoice.unpaid(clientId, filters,);
        return res.status(statusCode.OK).send({
            message: "List found successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive 
exports.changeStatus = async (req, res, next) => {
    try {
        const { id, status, clientId, } = req.body;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblHolidayIdIdAndClientIdRequired,
            });
        }
        const updated = await purchaseInvoice.changeStatus(clientId, id, {
            status: status,
        });

        return res.status(statusCode.OK).send({
            message: "Status updated successfully",
            id: updated
        })
    } catch (error) {
        next(error);
    }
}; 