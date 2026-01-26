



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
const sectionSchema = require("../../client/model/section");
const productBlueprintSchema = require("../../client/model/productBlueprint");



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
        const { clientId } = req.query;
        console.log("req.query", req.query);
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
        };
        const result = await sectionService.list(clientId, filters);
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


exports.updateSectionOrders = async (req, res) => {
    try {
        const { updates, clientId } = req.body;

        console.log("updates", updates);
        
        console.log("clientId", clientId);
        

        const parsedUpdate = JSON.parse(updates)

        // Basic validation
        if (!Array.isArray(parsedUpdate) || parsedUpdate.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request body. Expected an array of { _id, order } objects.',
            });
        }

        // Optional: Validate that all orders are unique numbers
        const orderValues = parsedUpdate.map(u => u.order);
        const uniqueOrders = new Set(orderValues);
        if (uniqueOrders.size !== parsedUpdate.length) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate order values detected. All orders must be unique.',
            });
        }

        // Optional: Validate that orders are sequential starting from 1 (recommended)
        const sortedOrders = [...orderValues].sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length; i++) {
            if (sortedOrders[i] !== i + 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Orders must be sequential integers starting from 1 (1, 2, 3, ...).',
                });
            }
        }

        // Prepare bulk operations
        const bulkOps = parsedUpdate.map(update => ({
            updateOne: {
                filter: {
                    _id: new mongoose.Types.ObjectId(update._id),
                    // Optional: Add createdBy filter for security if you have authentication
                    // createdBy: req.user._id  // Uncomment if you have req.user from auth middleware
                },
                update: {
                    $set: { order: update.order },
                },
                upsert: false,
            },
        }));

        const clientConnection = await getClientDatabaseConnection(clientId);
        const Section = clientConnection.model("section", sectionSchema);
        const ProductBluePrint = clientConnection.model('productBlueprint', productBlueprintSchema);

        // Execute bulk write (atomic operation)
        const result = await Section.bulkWrite(bulkOps, { ordered: true });

        // Check if all operations succeeded
        if (result.modifiedCount !== parsedUpdate.length) {
            return res.status(400).json({
                success: false,
                message: `Only ${result.modifiedCount} out of ${parsedUpdate.length} sections were updated. Some IDs may not exist.`,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Section orders updated successfully',
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        console.error('Error updating section orders:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating orders',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
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






















































