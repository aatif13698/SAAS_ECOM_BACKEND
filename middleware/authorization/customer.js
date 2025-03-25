// const jwt = require("jsonwebtoken");
// const dotnev = require("dotenv");
// const userModel = require("../../model/user");
// dotnev.config();
// const PRIVATEKEY = process.env.PRIVATEKEY;
// const statusCode = require('../../utils/http-status-code');
// const message = require("../../utils/message");
// const { getClientDatabaseConnection } = require("../../db/connection");
// const clinetUserSchema = require("../../client/model/user");





// //  customer auth
// exports.customer = async (req, res, next) => {

//     let token;
//     const { authorization } = req.headers;

//     if (authorization && authorization.startsWith("Bearer")) {
//         try {
//             token = authorization.split(" ")[1];
//             const { id, identifier } = jwt.verify(token, PRIVATEKEY);

//             if (!id) {
//                 throw new Error(message.lblUnauthorizeUser || "Unauthorized user");
//             }

//             const clientConnection = await getClientDatabaseConnection(id);
//             const userModel = clientConnection.model('clientUsers', clinetUserSchema);

//             // Determine if identifier is an email or phone
//             const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
//             const isPhone = /^\d{10}$/.test(identifier);
//             const query = isEmail ? { email: identifier } : { phone: identifier };


//             const User = await userModel.findOne(query);

//             if (User) {
//                 if (User.roleId !== 0) {
//                     throw new Error(message.lblUnauthorizeUser || "Unauthorized user");
//                 } else {
//                     req.user = User;
//                     next();
//                 }
//             } else {
//                 throw new Error(message.lblUserNotFound || "user not found");
//             }


//         } catch (error) {
//             console.log(error);
//             throw new Error(error.message || `Invalid token or verification failed.}`);
//         }

//     } else {
//         throw new Error(message.lblNoToken);
//     }
// };



// new code
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv"); // Fixed typo: dotnev -> dotenv
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const { getClientDatabaseConnection } = require("../../db/connection");
const clientUserSchema = require("../../client/model/user"); // Fixed typo: clinetUserSchema -> clientUserSchema

dotenv.config(); // Fixed typo: dotnev -> dotenv
const PRIVATEKEY = process.env.PRIVATEKEY;

// Customer auth middleware
exports.customer = async (req, res, next) => {
    let token;
    const { authorization } = req.headers;

    

    try {
        // Check if Authorization header exists and starts with "Bearer"
        if (!authorization || !authorization.startsWith("Bearer")) {
            return res.status(statusCode.Unauthorized).json({
                message: message.lblNoToken || "No token provided",
            });
        }

        // Extract token from Authorization header
        token = authorization.split(" ")[1];
        if (!token) {
            return res.status(statusCode.Unauthorized).json({
                message: message.lblNoToken || "Invalid token format",
            });
        }

        // Verify JWT token
        const { id, identifier } = jwt.verify(token, PRIVATEKEY);
        if (!id) {
            return res.status(statusCode.Unauthorized).json({
                message: message.lblUnauthorizeUser || "Unauthorized user",
            });
        }

        // Establish client database connection and get user model
        const clientConnection = await getClientDatabaseConnection(id);
        const userModel = clientConnection.model("clientUsers", clientUserSchema);

        // Determine if identifier is an email or phone
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10}$/.test(identifier);
        const query = isEmail ? { email: identifier } : isPhone ? { phone: identifier } : null;

        if (!query) {
            return res.status(statusCode.BadRequest).json({
                message: "Invalid identifier format",
            });
        }

        // Find user in the database
        const user = await userModel.findOne(query);
        if (!user) {
            return res.status(statusCode.NotFound).json({
                message: message.lblUserNotFound || "User not found",
            });
        }

        // Check if user has the correct role (roleId === 0 for customer)
        if (user.roleId !== 0) {
            return res.status(statusCode.Unauthorized).json({
                message: message.lblUnauthorizeUser || "Unauthorized user",
            });
        }

        // Attach user to request and proceed
        req.user = user;
        next();
    } catch (error) {
        console.error("Customer Middleware Error:", error.message);

        // Handle specific JWT errors
        if (error.name === "JsonWebTokenError") {
            return res.status(statusCode.Unauthorized).json({
                message: "Invalid or malformed token",
            });
        } else if (error.name === "TokenExpiredError") {
            return res.status(statusCode.Unauthorized).json({
                message: "Token has expired",
            });
        } else {
            // Generic error response for other cases
            return res.status(statusCode.InternalServerError).json({
                message: error.message || "Authentication error",
            });
        }
    }
};