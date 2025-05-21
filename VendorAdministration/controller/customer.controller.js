



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const customerService = require("../services/customer.service");
const bcrypt = require("bcrypt")


// create 
// exports.create = async (req, res, next) => {
//     try {
//         const { clientId, level, businessUnit, branch, warehouse, roleId, firstName, lastName, email, phone, password, gender, city, state, country, ZipCode, address } = req.body;
//         const mainUser = req.user;
//         if (!clientId) {
//             return res.status(statusCode.BadRequest).send({
//                 message: message.lblClinetIdIsRequired,
//             });
//         }
//         if (!firstName || !lastName || !email || !phone || !password || !gender || !level || !roleId) {
//             return res.status(statusCode.BadRequest).send({
//                 message: message.lblRequiredFieldMissing,
//             });
//         }
//         const hashedPassword = await bcrypt.hash(password, 10);
//         let dataObject = {
//             firstName, lastName, email, phone, gender, roleId, city, state, country, ZipCode, address,
//             password: hashedPassword,
//             createdBy: mainUser._id,
//         }
//         if (level === "vendor") {
//             dataObject = {
//                 ...dataObject,
//                 isVendorLevel: true,
//                 isBuLevel: false,
//                 isBranchLevel: false,
//                 isWarehouseLevel: false,
//             }
//         } else if (level === "business") {

//             if (!businessUnit) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblBusinessUnitIdIdRequired,
//                 });
//             }
//             dataObject = {
//                 ...dataObject,
//                 businessUnit: businessUnit,
//                 isVendorLevel: false,
//                 isBuLevel: true,
//                 isBranchLevel: false,
//                 isWarehouseLevel: false,
//             }
//         } else if (level === "branch") {
//             if (!businessUnit) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblBusinessUnitIdIdRequired,
//                 });
//             }
//             if (!branch) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblBranchIdIdRequired,
//                 });
//             }
//             dataObject = {
//                 ...dataObject,
//                 businessUnit: businessUnit,
//                 branch: branch,
//                 isVendorLevel: false,
//                 isBuLevel: false,
//                 isBranchLevel: true,
//                 isWarehouseLevel: false,
//             }
//         } else if (level === "warehouse") {
//             if (!businessUnit) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblBusinessUnitIdIdRequired,
//                 });
//             }
//             if (!branch) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblBranchIdIdRequired,
//                 });
//             }

//             if (!warehouse) {
//                 return res.status(statusCode.BadRequest).send({
//                     message: message.lblWarehouseIdIdRequired,
//                 });
//             }
//             dataObject = {
//                 ...dataObject,
//                 businessUnit: businessUnit,
//                 branch: branch,
//                 warehouse: warehouse,
//                 isVendorLevel: false,
//                 isBuLevel: false,
//                 isBranchLevel: false,
//                 isWarehouseLevel: true,
//             }
//         }
//         if (req.file && req.file.filename) {
//             dataObject = {
//                 ...dataObject,
//                 icon: req.file.filename
//             }
//         }
//         const newBusinessUnit = await customerService.create(clientId, { ...dataObject });
//         return res.status(statusCode.OK).send({
//             message: message.lblBranchCreatedSuccess,
//             data: { businessUnitId: newBusinessUnit._id },
//         });
//     } catch (error) {
//         next(error)
//     }
// };

exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            // level,
            // businessUnit,
            // branch,
            // warehouse,
            // roleId,
            firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [firstName, lastName, email, phone, password, gender];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }


        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const role = await Role.findOne({ id: 0 });
        if (!role) {
            throw new CustomError(statusCode.Conflict, message.lblRoleNotFound);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Base data object
        const dataObject = {
            firstName,
            lastName,
            email,
            phone,
            gender,
            role: role._id,
            roleId: role.id,
            city,
            state,
            country,
            ZipCode,
            address,
            password: hashedPassword,
            createdBy: mainUser._id,

            tc: true,
            isUserVerified: true,
        };

        // Add file icon if present
        if (req.file?.filename) {
            dataObject.profileImage = req.file.filename;
        }

        // Create 
        const newCustomer = await customerService.create(clientId, dataObject);

        return res.status(statusCode.OK).send({
            message: message.lblCustomerCreatedSuccess,
            data: { customerId: newCustomer._id },
        });

    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {

    try {
        const {
            clientId,
            customerId,
            firstName,
            lastName,
            email,
            phone,
            password,
            gender,
            city,
            state,
            country,
            ZipCode,
            address,
        } = req.body;
        const mainUser = req.user;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }
        const requiredFields = [firstName, lastName, email, phone, gender];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }
        const dataObject = {
            firstName,
            lastName,
            email,
            phone,
            gender,
            city,
            state,
            country,
            ZipCode,
            address,
            createdBy: mainUser._id,
        };
        let hashedPassword = "";
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
            dataObject.password = hashedPassword;
        }
        if (req.file?.filename) {
            dataObject.icon = req.file.filename;
        }
        const updated = await customerService.update(clientId, customerId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblCustomerUpdatedSuccess,
        });
    } catch (error) {
        next(error);
    }
};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, customerId } = req.params;
        if (!clientId || !customerId) {
            return res.status(400).send({
                message: message.lblCustomerIdIdAndClientIdRequired,
            });
        }
        const customer = await customerService.getById(clientId, customerId);
        return res.status(200).send({
            message: message.lblCustomerFoundSucessfully,
            data: customer,
        });
    } catch (error) {
        next(error)
    }
};


// list 
// old
// exports.list = async (req, res, next) => {
//     try {

//         const mainUser = req.user;
//         const { clientId, keyword = '', page = 1, perPage = 10 } = req.query;
//         if (!clientId) {
//             return res.status(statusCode.BadRequest).send({
//                 message: message.lblClinetIdIsRequired,
//             });
//         }
//         const filters = {
//             deletedAt: null,
//             _id : {$ne : mainUser?._id },
//             roleId: { $gt: 1, $ne: 0 },
//             ...(keyword && {
//                 $or: [
//                     { firstName: { $regex: keyword.trim(), $options: "i" } },
//                     { lastName: { $regex: keyword.trim(), $options: "i" } },
//                     { email: { $regex: keyword.trim(), $options: "i" } },
//                     { phone: { $regex: keyword.trim(), $options: "i" } },
//                 ],
//             }),
//         };
//         const result = await customerService.list(clientId, filters, { page, limit: perPage });
//         return res.status(statusCode.OK).send({
//             message: message.lblBranchFoundSucessfully,
//             data: result,
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// new
exports.list = async (req, res, next) => {
    try {

        const mainUser = req.user;
        const { clientId, keyword = '', page = 1, perPage = 10, } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            _id: { $ne: mainUser?._id },
            roleId: 0,
            ...(keyword && {
                $or: [
                    { firstName: { $regex: keyword.trim(), $options: "i" } },
                    { lastName: { $regex: keyword.trim(), $options: "i" } },
                    { email: { $regex: keyword.trim(), $options: "i" } },
                    { phone: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };



        const result = await customerService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblBranchFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

exports.activeinactive = async (req, res, next) => {
    try {
        const { keyword, page, perPage, id, status, clientId } = req.body;
        req.query.clientId = clientId;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        if (!clientId || !id) {
            return res.status(400).send({
                message: message.lblCustomerIdIdAndClientIdRequired,
            });
        }
        const updated = await customerService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
    }
};




// Soft delete employee 
exports.softDelete = async (req, res, next) => {
    try {
        const { keyword, page, perPage, employeeId, clientId } = req.body;
        console.log("req.body", req.body);

        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !employeeId) {
            return res.status(400).send({
                message: message.lblEmployeeIdIdAndClientIdRequired,
            });
        }
        await customerService.deleted(clientId, employeeId, softDelete = true)
        this.list(req, res, next);
    } catch (error) {
        next(error);
    }
};

// restore Branch by vendor
exports.restoreBranchByVendor = async (req, res, next) => {
    try {
        const { keyword, page, perPage, branchId, clientId } = req.body;
        req.query.keyword = keyword;
        req.query.page = page;
        req.query.perPage = perPage;
        req.query.clientId = clientId;
        if (!clientId || !branchId) {
            return res.status(400).send({
                message: message.lblBusinessUnitIdIdAndClientIdRequired,
            });
        }
        await customerService.restore(clientId, branchId)
        this.listBranch(req, res, next);
    } catch (error) {
        next(error)
    }
};



// get branch by business unit
exports.getBranchByBusinessUnit = async (req, res, next) => {
    try {
        const { clientId, businessUnitId } = req.params;
        if (!clientId || !businessUnitId) {
            return res.status(400).send({
                message: message.lblRequiredFieldMissing,
            });
        }
        const branch = await customerService.getBranchByBusiness(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};




