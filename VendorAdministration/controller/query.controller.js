const statusCode = require("../../utils/http-status-code"); 
const message = require("../../utils/message"); 
const queryService = require("../services/query.service"); 
 


exports.listQuery = async (req, res, next) => { 
    try { 
 
        const mainUser = req.user; 
        const { clientId, keyword = '', page = 1, perPage = 10, } = req.query; 
        if (!clientId) { 
            return res.status(statusCode.BadRequest).send({ 
                message: message.lblClinetIdIsRequired, 
            }); 
        } 
        let filters = { 
            ...(keyword && { 
                $or: [ 
                    { question: { $regex: keyword.trim(), $options: "i" } }, 
                ], 
            }), 
        }; 
 
        const result = await queryService.listQuery(clientId, filters, { page, limit: perPage }); 
        return res.status(statusCode.OK).send({ 
            message: "Query found successfully", 
            data: result, 
        }); 
    } catch (error) { 
        next(error); 
    } 
}; 


exports.updateQuery = async (req, res, next) => { 
    try { 
        const { 
            clientId, 
            queryId, 
            question, 
            answer, 
        } = req.body; 
        const mainUser = req.user; 
        if (!clientId || !question || !answer) { 
            return res.status(statusCode.BadRequest).json({ message: message.lblRequiredFieldMissing }); 
        } 
        // Validate required fields 
        if (!clientId) { 
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired }); 
        } 
        const requiredFields = [ 
            clientId, 
            queryId, 
            question, 
            answer, 
        ]; 
        if (requiredFields.some((field) => !field)) { 
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing }); 
        } 
        // Base data object 
        const dataObject = { 
            question, 
            answer, 
            hasAnswered: true, 
            createdBy: mainUser._id, 
        }; 
        const newQA = await queryService.updateQuery(clientId, queryId, dataObject); 
        return res.status(statusCode.OK).send({ 
            message: "Query updated successfully", 
            data: { id: newQA._id }, 
        }); 
    } catch (error) { 
        next(error); 
    } 
}; 


exports.getQueryById = async (req, res, next) => { 
    try { 
        const { clientId, id } = req.params; 
        if (!clientId || !id) { 
            return res.status(400).send({ 
                message: message.lblRequiredFieldMissing, 
            }); 
        } 
        const query = await queryService.getQueryById(clientId, id); 
        return res.status(200).send({ 
            message: "Query found successfully.", 
            data: query, 
        }); 
    } catch (error) { 
        next(error) 
    } 
}; 