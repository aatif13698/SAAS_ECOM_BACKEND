

const CustomError = require("../../utils/customeError");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code")


exports.commonCheckForClient = async (user) => {

    try {

        if (!user) {
            throw new CustomError(statusCode.BadRequest, message.lblNotFoundUser);
        }

        // Check if account is active
        if (!user.isActive) {
            throw new CustomError(statusCode.Unauthorized, message.lblAccountDeactivate);
        }

        // Check if account is verified
        if (!user.isUserVerified) {
            throw new CustomError(statusCode.Unauthorized, message.lblUnVerified);
        }

        // Check if user has the appropriate role
        if (user.roleId < 2) {
            throw new CustomError(statusCode.Unauthorized, message.lblUnauthorize);
        }

        return true

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error staff auth: ${error.message}`);
    }
}



exports.commonCheckForCustomer = async (user) => {

    try {


        console.log("user",user);
        

        if (!user) {
            throw new CustomError(statusCode.BadRequest, message.lblNotFoundUser);
        }

        // Check if account is active
        if (!user.isActive) {
            throw new CustomError(statusCode.Unauthorized, message.lblAccountDeactivate);
        }

        // Check if account is verified
        if (!user.isUserVerified) {
            throw new CustomError(statusCode.Unauthorized, message.lblUnVerified);
        }

        // Check if user has the appropriate role
        if (user.roleId !== 0) {
            throw new CustomError(statusCode.Unauthorized, message.lblUnauthorize);
        }

        return true

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error staff auth: ${error.message}`);
    }
}