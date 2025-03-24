const jwt = require("jsonwebtoken");
const dotnev = require("dotenv");
const userModel = require("../../model/user");
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;
const statusCode = require('../../utils/http-status-code');
const message = require("../../utils/message")





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
           return   res.status(statusCode.Unauthorized).send({ message: error.message });
        }

    } else {
        return  res.send({ status:  message.lblNoToken});
    }
};