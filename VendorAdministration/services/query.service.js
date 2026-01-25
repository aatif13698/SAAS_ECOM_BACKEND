const querySchema = require("../../client/model/query");
const clinetUserSchema = require("../../client/model/user");
const { getClientDatabaseConnection } = require("../../db/connection");
const httpStatusCode = require("../../utils/http-status-code");






const listQuery = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Query = clientConnection.model("query", querySchema);
        const User = clientConnection.model('clientUsers', clinetUserSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [queries, total] = await Promise.all([
            Query.find(filters).skip(skip).populate({
                path: "userId",
                model: User,
                select: " firstName lastName profileImage email phone "
            }),
            Query.countDocuments(filters),
        ]);
        return { count: total, queries };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const updateQuery = async (clientId, qaId, updateData) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const Query = clientConnection.model("query", querySchema);
        const query = await Query.findById(qaId);  
        if (!query) {  
            throw new CustomError(httpStatusCode.NotFound, "Query not found");  
        }  
        Object.assign(query, updateData);  
        await query.save();  
        return query  

    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error updating: ${error.message}`);  
    }  
}; 


const getQueryById = async (clientId, id) => {  
    try {  
        const clientConnection = await getClientDatabaseConnection(clientId);  
        const Query = clientConnection.model("query", querySchema);
        const query = await Query.findById (id); 
        if (!query) {  
            throw new CustomError(httpStatusCode.NotFound, "Queery not found.");  
        }  
        return query;  
    } catch (error) {  
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);  
    }  
}; 


module.exports = {
    listQuery,
    getQueryById,
    updateQuery
};  