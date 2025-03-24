const jwt = require("jsonwebtoken");
const dotnev = require("dotenv");
const userModel = require("../../model/user");
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;
const statusCode = require('../../utils/http-status-code');
const message = require("../../utils/message");
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetUserSchema = require("../../client/model/user");





//  customer auth
exports.customer = async (req, res, next) => {

    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];
            const { id, identifier } = jwt.verify(token, PRIVATEKEY);

            if (!id) {
                throw new Error(message.lblUnauthorizeUser || "Unauthorized user");
            }

            const clientConnection = await getClientDatabaseConnection(id);
            const userModel = clientConnection.model('clientUsers', clinetUserSchema);

            // Determine if identifier is an email or phone
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
            const isPhone = /^\d{10}$/.test(identifier);
            const query = isEmail ? { email: identifier } : { phone: identifier };


            const User = await userModel.findOne(query);

            if (User) {
                if (User.roleId !== 0) {
                    throw new Error(message.lblUnauthorizeUser || "Unauthorized user");
                } else {
                    req.user = User;
                    next();
                }
            } else {
                throw new Error(message.lblUserNotFound || "user not found");
            }


        } catch (error) {
            console.log(error);
            throw new Error(error.message || `Invalid token or verification failed.}`);
        }

    } else {
        throw new Error(message.lblNoToken);
    }
};