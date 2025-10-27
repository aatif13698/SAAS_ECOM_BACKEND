



const productMainStockSchema = require("../../client/model/productMainStock");
const questionAndAnswerProductSchema = require("../../client/model/questionAndAnswerProduct");
const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const productQaService = require("../services/productQA.service");
const bcrypt = require("bcrypt")


// create
exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            businessUnit,
            branch,
            warehouse,
            userId,
            productStock,
            productMainStockId,
            isPredefined,
            question,
            answer,
        } = req.body;
        if (!productMainStockId || !clientId || !productStock || !question || !answer) {
            return res.status(statusCode.BadRequest).json({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const QuestionAndAnswerProduct = clientConnection.model('questionAndAnswer', questionAndAnswerProductSchema)
        // Check if product exists
        const product = await ProductMainStock.findById(productMainStockId);
        if (!product) {
            return res.status(statusCode.NotFound).json({ message: 'Product not found' });
        }
        const existingQuestion = await QuestionAndAnswerProduct.findOne({ userId: userId, warehouse, productMainStockId, question });
        if (existingQuestion) {
            return res.status(statusCode.BadRequest).json({ message: 'You have already raised this question for this product.' });
        }
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            clientId,
            businessUnit,
            branch,
            warehouse,
            userId,
            productStock,
            productMainStockId,
            question,
            answer,
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            userId,
            businessUnit,
            branch,
            warehouse,
            productStock,
            productMainStockId,
            isPredefined,
            question,
            answer,
            isVerified: true,
            hasAnswered: true,
            createdBy: mainUser._id,
        };
        const newQA = await productQaService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblProductQACreatedSuccess,
            data: { workingDepartmentId: newQA._id },
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
            assetId,
            level,
            businessUnit,
            branch,
            warehouse,

            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
        } = req.body;

        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            notes,
            expirationDate
        ];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            assetName,
            serialNumber,
            model,
            purchaseDate,
            purchaseCost,
            currentValue,
            usefulLife,
            status,
            condition,
            warrantyEndDate,
            disposalDate,
            disposalReason,
            notes,
            expirationDate,
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
        const updated = await productQaService.update(clientId, assetId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblAssetUpdatedSuccess,
        });

    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, assetId } = req.params;
        if (!clientId || !assetId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const asset = await productQaService.getById(clientId, assetId);
        return res.status(200).send({
            message: message.lblAssetFoundSucessfully,
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
                    { assetName: { $regex: keyword.trim(), $options: "i" } },
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
                isWarehouseLevel: levelId
            }
        }

        const result = await productQaService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblAssetFoundSucessfully,
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
                message: message.lblEmployeeIdIdAndClientIdRequired,
            });
        }
        const updated = await productQaService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};

// assign
// exports.assign = async (req, res, next) => {
//     try {
//         const { useId } = req.body;
//         const newAssigned = await productQaService.assignToEmployee(clientId, useId, req.params.assetId);
//         return res.status(statusCode.OK).send({
//             message: message.lblAssetCreatedSuccess,
//             data: { newAssigned: newAssigned._id },
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// unassign
// exports.unAssign = async (req, res, next) => {
//     try {
//         const { useId } = req.body;
//         const newAssigned = await productQaService.assignToEmployee(clientId, useId, req.params.assetId);
//         return res.status(statusCode.OK).send({
//             message: message.lblAssetCreatedSuccess,
//             data: { newAssigned: newAssigned._id },
//         });
//     } catch (error) {
//         next(error);
//     }
// };


// create request
exports.createRequest = async (req, res, next) => {
    try {
        const {
            clientId,
            assetId,
            employeeId,
            requestType,
            reason,
            status,
            notes,
        } = req.body;
        const mainUser = req.user;
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            assetId,
            employeeId,
            requestType,
            reason,
            status,
            notes,
        ];

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            assetId,
            employeeId,
            requestType,
            reason,
            status,
            notes,
            createdBy: mainUser._id,
        };
        const newRequest = await productQaService.createRequest(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: "Request submitted successfully",
            data: { request: newRequest._id },
        });
    } catch (error) {
        next(error);
    }
};



















































