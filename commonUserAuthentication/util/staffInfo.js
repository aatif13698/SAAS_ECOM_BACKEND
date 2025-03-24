



const { getClientDatabaseConnection } = require("../../db/connection");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role")

const CustomError = require("../../utils/customeError");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");

exports.staffInfo = async (clientId, email) => {

    try {

        const clientConnection = await getClientDatabaseConnection(clientId);
        const ClientUser = clientConnection.model('clientUsers', clinetUserSchema);
        clientConnection.model("clientRoles", clientRoleSchema);
        const client = await ClientUser.findOne({ email: email }).select('-deletedAt -createdAt -updatedAt -isActive -isUserVerified -tc -password').populate('role', '-deletedAt -isActive -createdAt -updatedAt');

        // Check if clinet exists
        if (!ClientUser) {
            throw new CustomError(statusCode.NotFound, message.lblUserNotFound);
        }
        return client

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error clinet auth: ${error.message}`);
    }
}