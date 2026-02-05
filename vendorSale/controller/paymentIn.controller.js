const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const paymentInService = require("../service/paymentIn.service")


exports.create = async (req, res, next) => {
    const mainUser = req.user;
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,

            customer,
            customerLedger,
            paymentInNumber,
            paymentInDate,
            paymentMethod,
            paidAmount,
            receivedIn,
            notes,

            payments,

        } = req.body;


        const mainUser = req.user;

        // Validate required fields 
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            customer,
            customerLedger,
            paymentInNumber,
            paymentInDate,
            paymentMethod,
            paidAmount,
            receivedIn,
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
            customer,
            customerLedger,
            paymentInNumber,
            paymentInDate,
            paymentMethod,
            paidAmount,
            receivedIn,
            notes,

            payments,
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

        const newPaymentOut = await paymentInService.create(clientId, dataObject, mainUser);
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
        const result = await paymentInService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: "List found successfully.",
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
        const paymentIn = await paymentInService.getById(clientId, id);
        return res.status(200).send({
            message: "Payment in found successfully.",
            data: paymentIn,
        });
    } catch (error) {
        next(error)
    }
};
