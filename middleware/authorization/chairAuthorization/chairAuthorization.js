const jwt = require("jsonwebtoken");
const dotnev = require("dotenv");
dotnev.config();
const PRIVATEKEY = process.env.PRIVATEKEY;
const statusCode = require('../../../utils/http-status-code');
const message = require("../../../utils/message");

const { getClientDatabaseConnection } = require("../../../db/connection");
const clinetUserSchema = require("../../../client/model/user");
const clientRoleSchema = require("../../../client/model/role")

// const userModel = require("../../../model/user")

//  chair create auth
exports.chiarCreateAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);
        if (!capability?.subMenus?.create?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair get auth
exports.chiarGetAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);
        if (!capability?.subMenus?.view?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair update auth
exports.chiarUpdateAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.update?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair active inactive auth
exports.chiarActiveInactiveAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.activeActive?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair list auth 
exports.chiarListAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.list?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair hard delete auth 
exports.chiarHardDeleteAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.update?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next();
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair soft delete auth 
exports.chiarSoftDeleteAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.softDelete?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

// chair restore auth
exports.chiarRestoreAuth = async (req, res, next) => {
    try {
        const { capability, user } = await commonCheckOfChair(req.headers);

        if (!capability?.subMenus?.update?.access) {
            return res.send({
                message: message.lblUnauthorize
            })
        }
        req.user = user
        next()
    } catch (error) {
        console.log(error);
        return res.status(statusCode.Unauthorized).send({ message: error.message });
    }
};

//  common check
const commonCheckOfChair = async (header) => {
    const { authorization } = header;
    if (!authorization || !authorization.startsWith("Bearer")) {
        throw new Error(message.lblNoToken || "No token provided");
    }

    try {
        const token = authorization.split(" ")[1];
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

        const capability = user?.role?.capability?.find((item) => item.name === "Chair");
        if (!capability || !capability.access) {
            throw new Error(message.lblUnauthorize || "Unauthorized access");
        }

        return { capability, user };
    } catch (error) {
        throw new Error(error.message || "Invalid token or user verification failed");
    }
};