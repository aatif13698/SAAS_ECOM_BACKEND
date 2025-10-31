// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");  
const clinetBusinessUnitSchema = require("../../client/model/businessUnit");  
const clinetBranchSchema = require("../../client/model/branch");  
const message = require("../../utils/message");  
const statusCode = require("../../utils/http-status-code");  
const CustomError = require("../../utils/customeError");  
const clinetUserSchema = require("../../client/model/user");  
const clientRoleSchema = require("../../client/model/role");  

const clientWorkingDepartmentSchema = require("../../client/model/workingDepartment");  
const clientProductDepartmentSchema = require("../../client/model/productDepartment");  

const create = async (clientId, data) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const ProductDepartment = clientConnection.model('clientProductDepartment', clientProductDepartmentSchema);  
        return await ProductDepartment.create(data);  
    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error creating product deparment : ${error.message}`);  
    }  
};  

const update = async (clientId, shiftId, updateData) => {  

    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const ProductDepartment = clientConnection.model('clientProductDepartment', clientProductDepartmentSchema);  
        const productDepartment = await ProductDepartment.findById(shiftId);  
        if (!productDepartment) {  
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);  
        }  
        Object.assign(productDepartment, updateData);  
        await productDepartment.save();  
        return productDepartment  

    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error updating product deparment: ${error.message}`);  
    }  
};  

const getById = async (clientId, productDepartmentId) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const ProductDepartment = clientConnection.model('clientProductDepartment', clientProductDepartmentSchema);  
        const productDepartment = await ProductDepartment.findById(productDepartmentId);  
        if (!productDepartment) {  
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);  
        }  
        return productDepartment;  
    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error getting product deparment: ${error.message}`);  
    }  
};  

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const ProductDepartment = clientConnection.model('clientProductDepartment', clientProductDepartmentSchema);  
        const { page, limit } = options;  
        const skip = (page - 1) * limit;  
        const [productDepartment, total] = await Promise.all([  
            ProductDepartment.find(filters).skip(skip),  
            ProductDepartment.countDocuments(filters),  
        ]);  
        return { count: total, productDepartment };  
    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error listing product deparment: ${error.message}`);  
    }  
};  

const activeInactive = async (clientId, productDepartmentId, data) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const ProductDepartment = clientConnection.model('clientProductDepartment', clientProductDepartmentSchema);  
        const productDepartment = await ProductDepartment.findById(productDepartmentId);  
        if (!productDepartment) {  
            throw new CustomError(statusCode.NotFound, message.lblShiftNotFound);  
        }  
        Object.assign(productDepartment, data);  
        return await productDepartment.save();  
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