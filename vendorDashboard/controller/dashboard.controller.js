const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const dashboardService = require("../service/dashboard.service");
const bcrypt = require("bcrypt")
const { DateTime } = require('luxon');

// get counts  
exports.getCounts = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        const asset = await dashboardService.getCounts(clientId);
        return res.status(200).send({
            message: "Counts found successfully",
            data: asset,
        });
    } catch (error) {
        next(error)
    }
};



