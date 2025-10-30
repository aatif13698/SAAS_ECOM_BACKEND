



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
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        } = req.body;
        const mainUser = req.user;
        if (!productMainStockId || !clientId || !productStock || !question || !answer) {
            return res.status(statusCode.BadRequest).json({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const QuestionAndAnswerProduct = clientConnection.model('productqas', questionAndAnswerProductSchema)
        // Check if product exists
        const productt = await ProductMainStock.findById(productMainStockId);
        if (!productt) {
            return res.status(statusCode.NotFound).json({ message: 'Product not found' });
        }
        const existingQuestion = await QuestionAndAnswerProduct.findOne({ userId: mainUser._id, warehouse, productMainStockId, question });
        if (existingQuestion) {
            return res.status(statusCode.BadRequest).json({ message: 'You have already raised this question for this product.' });
        }
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            clientId,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        ];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            userId: mainUser._id,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            isPredefined: true,
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
            qaId,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        } = req.body;
        const mainUser = req.user;
        if (!productMainStockId || !clientId || !productStock || !question || !answer) {
            return res.status(statusCode.BadRequest).json({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const QuestionAndAnswerProduct = clientConnection.model('productqas', questionAndAnswerProductSchema)
        // Check if product exists
        const productt = await ProductMainStock.findById(productMainStockId);
        if (!productt) {
            return res.status(statusCode.NotFound).json({ message: 'Product not found' });
        }
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            clientId,
            qaId,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        ];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            userId: mainUser._id,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            isPredefined: true,
            question,
            answer,
            isVerified: true,
            hasAnswered: true,
            createdBy: mainUser._id,
        };
        const newQA = await productQaService.update(clientId, qaId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblProductQAUpdatedSuccess,
            data: { workingDepartmentId: newQA._id },
        });
    } catch (error) {
        next(error);
    }
};

exports.updateQaOut = async (req, res, next) => {
    try {
        const {
            clientId,
            qaId,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        } = req.body;
        const mainUser = req.user;
        if (!productMainStockId || !clientId || !productStock || !question || !answer) {
            return res.status(statusCode.BadRequest).json({ message: message.lblRequiredFieldMissing });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductMainStock = clientConnection.model('productMainStock', productMainStockSchema);
        const QuestionAndAnswerProduct = clientConnection.model('productqas', questionAndAnswerProductSchema)
        // Check if product exists
        const productt = await ProductMainStock.findById(productMainStockId);
        if (!productt) {
            return res.status(statusCode.NotFound).json({ message: 'Product not found' });
        }
        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [
            clientId,
            qaId,
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            question,
            answer,
        ];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        // Base data object
        const dataObject = {
            businessUnit,
            branch,
            warehouse,
            product,
            productStock,
            productMainStockId,
            isPredefined: false,
            question,
            answer,
            isVerified: false,
            hasAnswered: true,
            createdBy: mainUser._id,
        };
        const newQA = await productQaService.update(clientId, qaId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblProductQAUpdatedSuccess,
            data: { workingDepartmentId: newQA._id },
        });
    } catch (error) {
        next(error);
    }
};

// delete
exports.deleteOne = async (req, res, next) => {
    try {
        const { id } = req.params; // <-- Q&A document ID
        const clientId = req.body.clientId || req.query.clientId;

        if (!clientId) {
            return res.status(statusCode.BadRequest).json({ message: message.lblClinetIdIsRequired });
        }

        if (!id) {
            return res.status(statusCode.BadRequest).json({ message: "Q&A ID is required." });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema);

        const qa = await ProductQA.findById(id);
        if (!qa) {
            return res.status(statusCode.NotFound).json({ message: "Q&A not found." });
        }

        // Optional: Soft delete (recommended)
        // await ProductQA.findByIdAndUpdate(id, { deletedAt: new Date() });

        // OR Hard delete:
        await ProductQA.findByIdAndDelete(id);

        return res.status(statusCode.OK).json({
            message: "Q&A deleted successfully.",
            data: { deletedId: id }
        });

    } catch (error) {
        next(error);
    }
};

// publish Qa
exports.publishQaOut = async (req, res, next) => {
    try {
        const { id } = req.params; // <-- Q&A document ID
        const clientId = req.body.clientId || req.query.clientId;

        if (!clientId) {
            return res.status(statusCode.BadRequest).json({ message: message.lblClinetIdIsRequired });
        }

        if (!id) {
            return res.status(statusCode.BadRequest).json({ message: "Q&A ID is required." });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const ProductQA = clientConnection.model('productqas', questionAndAnswerProductSchema);

        const qa = await ProductQA.findById(id);
        if (!qa) {
            return res.status(statusCode.NotFound).json({ message: "Q&A not found." });
        }
        if (qa.isVerified) {
            qa.isVerified = false;
        } else {
            qa.isVerified = true;
        }

        await qa.save()
        return res.status(statusCode.OK).json({
            message: "Q&A published successfully.",
            data: { id: id }
        });

    } catch (error) {
        next(error);
    }
};

exports.getByProductMainStockId = async (req, res, next) => {
    try {
        const { clientId, productMainStockId } = req.params;
        if (!clientId || !productMainStockId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const qa = await productQaService.getByProductMainSockId(clientId, productMainStockId);
        return res.status(200).send({
            message: message.lblProductQAFoundSucessfully,
            data: qa,
        });
    } catch (error) {
        next(error)
    }
};

exports.getQaOutByProductMainStockId = async (req, res, next) => {
    try {
        const { clientId, productMainStockId } = req.params;
        if (!clientId || !productMainStockId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const qa = await productQaService.getQaOutByProductMainSockId(clientId, productMainStockId);
        return res.status(200).send({
            message: message.lblProductQAFoundSucessfully,
            data: qa,
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

// list QA Out
exports.listQaOut = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            // deletedAt: null,
            // isPredefined: false,
            ...(keyword && {
                $or: [
                    { question: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        // if (level == "vendor") {

        // } else if (level == "business" && levelId) {
        //     filters = {
        //         ...filters,
        //         // isBuLevel: true,
        //         businessUnit: levelId
        //     }
        // } else if (level == "branch" && levelId) {
        //     filters = {
        //         ...filters,
        //         // isBranchLevel: true,
        //         branch: levelId
        //     }
        // } else if (level == "warehouse" && levelId) {
        //     filters = {
        //         ...filters,
        //         // isBuLevel: true,
        //         isWarehouseLevel: levelId
        //     }
        // }

        const result = await productQaService.listQaOut(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblProductQAFoundSucessfully,
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



















































