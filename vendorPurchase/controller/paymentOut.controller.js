const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const paymentOutService = require("../services/paymentOut.service")


exports.create = async (req, res, next) => {
    const mainUser = req.user;
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,
            financialYear,

            supplier,
            supplierLedger,
            paymentOutNumber,
            paymentOutDate,
            paymentMethod,
            paidAmount,
            payedFrom,
            notes,

            payments,

        } = req.body;


        const mainUser = req.user;

        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            supplier,
            supplierLedger,
            paymentOutNumber,
            paymentOutDate,
            paymentMethod,
            paidAmount,
            payedFrom,
        ];

        console.log("requiredFields", requiredFields);


        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        if (payments?.length == 0) {
            return res.status(statusCode.BadRequest).send({ message: "Invoice is required" })
        }

        // Base data object 
        const dataObject = {
            supplier,
            supplierLedger,
            supplier,
            supplierLedger,
            paymentOutNumber,
            paymentOutDate,
            paymentMethod,
            paidAmount,
            payedFrom,
            notes,

            payments,
            createdBy: mainUser._id,
        };

        if (financialYear) {
            dataObject.financialYear = financialYear
        }

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

        const newPaymentOut = await paymentOutService.create(clientId, dataObject, mainUser);
        return res.status(statusCode.OK).send({
            message: "Payment out created successfully.",
            data: { holidayId: newPaymentOut._id },
        });
    } catch (error) {
        next(error);
    }
};

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
        const result = await paymentOutService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblHolidayFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};


exports.getParticularPaymentOut = async (req, res, next) => {
    try {
        const { clientId, id } = req.params;
        if (!clientId || !id) {
            return res.status(400).send({
                message: "Required fields are missing"
            });
        }
        const paymentOut = await paymentOutService.getById(clientId, id);
        return res.status(200).send({
            message: "Payment out found successfully.",
            data: paymentOut,
        });
    } catch (error) {
        next(error)
    }
};
