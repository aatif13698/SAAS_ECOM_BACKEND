const jwt = require("jsonwebtoken");
const dotnev = require("dotenv");
const userModel = require("../../model/user");
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;
const statusCode = require('../../utils/http-status-code');
const message = require("../../utils/message");
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetUserSchema = require("../../client/model/user");
const clientRoleSchema = require("../../client/model/role");





//  super admn auth
exports.superAdminAuth = async (req, res, next) => {

    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];
            const { id } = jwt.verify(token, PRIVATEKEY);

            if (id) {

                const User = await userModel.findById(id);

                if (User) {
                    if (User.roleId > 1) {
                        return res.send({
                            message: message.lblUnauthorizeUser,
                        });
                    } else {
                        req.user = User;
                        next();
                    }
                } else {
                    return res.send({
                        message: message.lblUserNotFound,
                    });
                }
            } else {
                return res.status(statusCode.Unauthorized).send({
                    message: message.lblUnauthorizeUser
                })
            }
        } catch (error) {
            console.log(error);
            return res.status(statusCode.Unauthorized).send({ message: error.message });
        }

    } else {
        return res.send({ status: message.lblNoToken });
    }
};



exports.tokenAuth = async (req, res, next) => {

    let token;
    const { authorization } = req.headers;

    if (authorization && authorization.startsWith("Bearer")) {
        try {
            token = authorization.split(" ")[1];
            const { id, email } = jwt.verify(token, PRIVATEKEY);
            if (!id) {
                throw new Error(message.lblUnauthorizeUser || "Unauthorized user");
            }
            const clientConnection = await getClientDatabaseConnection(id);
            const userModel = clientConnection.model('clientUsers', clinetUserSchema);
            clientConnection.model('clientRoles', clientRoleSchema);

            const user = await userModel.findOne({ email }).populate("role").lean();
            if (!user) {
                throw new Error(message.lblUserNotFound || "User not found");
            }
            req.user = user;
            next();
            // if (id) {
            //     const User = await userModel.findById(id);
            //     if (User) {
            //         req.user = User;
            //         next();
            //     } else {
            //         return res.send({
            //             message: message.lblUserNotFound,
            //         });
            //     }
            // } else {
            //     return res.status(statusCode.Unauthorized).send({
            //         message: message.lblUnauthorizeUser
            //     })
            // }
        } catch (error) {
            console.log(error);
            return res.status(statusCode.Unauthorized).send({ message: error.message });
        }

    } else {
        return res.send({ status: message.lblNoToken });
    }
};