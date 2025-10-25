// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection"); 
const message = require("../../utils/message"); 
const statusCode = require("../../utils/http-status-code"); 
const CustomError = require("../../utils/customeError"); 
const clientAssetSchema = require("../../client/model/asset"); 
const leaveCategorySchema = require("../../client/model/leaveCategories"); 


const create = async (clientId, data) => { 
    try { 
        const clientConnection = await getClientDatabaseConnection(clientId); 
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema); 
        return await LeaveCategory.create(data); 
    } catch (error) { 
        throw new CustomError(error.statusCode || 500, `Error creating leave category : ${error.message}`); 
    } 
}; 

const update = async (clientId, leaveCategoryId, updateData) => { 
    try { 
        const clientConnection = await getClientDatabaseConnection(clientId); 
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema); 
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId); 
        if (!leaveCategory) { 
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound); 
        } 
        Object.assign(leaveCategory, updateData); 
        await leaveCategory.save(); 
        return leaveCategory 
    } catch (error) { 
        throw new CustomError(error.statusCode || 500, `Error updating leave category: ${error.message}`); 
    } 
}; 


const getById = async (clientId, leaveCategoryId) => { 
    try { 
        const clientConnection = await getClientDatabaseConnection(clientId); 
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema); 
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId); 
        if (!leaveCategory) { 
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound); 
        } 
        return leaveCategory; 
    } catch (error) { 
        throw new CustomError(error.statusCode || 500, `Error getting leave category: ${error.message}`); 
    } 
}; 


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => { 
    try { 
        const clientConnection = await getClientDatabaseConnection(clientId); 
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema); 
        const { page, limit } = options; 
        const skip = (page - 1) * limit; 
        const [leaveCategories, total] = await Promise.all([ 
            LeaveCategory.find(filters).skip(skip), 
            LeaveCategory.countDocuments(filters), 
        ]); 
        return { count: total, leaveCategories }; 
    } catch (error) { 
        throw new CustomError(error.statusCode || 500, `Error listing leave category: ${error.message}`); 
    } 
}; 


const activeInactive = async (clientId, leaveCategoryId, data) => { 
    try { 
        const clientConnection = await getClientDatabaseConnection(clientId); 
        const LeaveCategory = clientConnection.model('leaveCategory', leaveCategorySchema); 
        const leaveCategory = await LeaveCategory.findById(leaveCategoryId); 
        if (!leaveCategory) { 
            throw new CustomError(statusCode.NotFound, message.lblLeaveCategoryNotFound); 
        } 
        Object.assign(leaveCategory, data); 
        return await leaveCategory.save(); 
    } catch (error) { 
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`); 
    } 
}; 


module.exports = { 
    create, 
    update, 
    getById, 
    list, 
    activeInactive, 
}; 