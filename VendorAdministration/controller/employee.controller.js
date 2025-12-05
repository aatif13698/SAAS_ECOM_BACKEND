



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const employeeService = require("../services/employee.service");
const bcrypt = require("bcrypt");


const { v4: uuidv4 } = require('uuid');
const path = require('path');
const AWS = require('aws-sdk');
// DigitalOcean Spaces setup
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT);
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.DO_SPACES_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET,
    s3ForcePathStyle: true,
    maxRetries: 5,
    retryDelayOptions: { base: 500 },
    httpOptions: { timeout: 60000 },
});

// Helper function to upload file to DigitalOcean Spaces
const uploadIconToS3 = async (file, clientId) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `saasEcommerce/${clientId}/employee/${uuidv4()}${fileExtension}`;
    const params = {
        Bucket: process.env.DO_SPACES_BUCKET,
        Key: fileName,
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        Metadata: {
            'original-filename': file.originalname
        }
    };
    try {
        const { Location } = await s3.upload(params).promise();
        return {
            success: true,
            url: Location,
            key: fileName
        };
    } catch (error) {
        console.log("error in s3", error);

        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
};


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
//         const newBusinessUnit = await employeeService.create(clientId, { ...dataObject });
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
            level,
            businessUnit,
            branch,
            warehouse,
            shift,
            department,
            roleId,
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

        const requiredFields = [firstName, lastName, email, phone, password, gender, level, roleId, shift, department];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }


        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const role = await Role.findById(roleId);
        if (!role) {
            throw new CustomError(statusCode.Conflict, message.lblRoleNotFound);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Base data object
        const dataObject = {
            firstName,
            lastName,
            email: email.toLowerCase(),
            phone,
            gender,
            role: roleId,
            roleId: role.id,
            shift: shift,
            workingDepartment: department,
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

        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level
        if (businessUnit) {
            dataObject.businessUnit = businessUnit;
        }
        if (branch) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse) {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        // Add file icon if present
        // if (req.file?.filename) {
        //     dataObject.profileImage = req.file.filename;
        // }
        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.profileImage = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }

        // Create 
        const newEmployee = await employeeService.create(clientId, dataObject);

        const masterRole = await roleModel.findOne({ id: 4 });
        const existingStaff = await userModel.findOne({
            $or: [{ email: email.toLowerCase() }, { phone }],
        });

        if (existingStaff) {
            const isAccessUnitAlreadyExists = existingStaff.accessUnit.find((item) => item.id == clientId);

            if (isAccessUnitAlreadyExists) {

                return res.status(statusCode.OK).send({
                    message: message.lblEmployeeCreatedSuccess,
                    data: { empId: newEmployee._id },
                });

            } else {

                existingStaff.accessUnit = [...existingStaff.accessUnit, { id: clientId }];

                await existingStaff.save()

                return res.status(statusCode.OK).send({
                    message: message.lblEmployeeCreatedSuccess,
                    data: { empId: newEmployee._id },
                });

            }
        } else {

            const newStaff = await userModel.create(
                [
                    {
                        firstName,
                        lastName,
                        email: email.toLowerCase(),
                        phone,
                        password: hashedPassword,
                        role: masterRole._id,
                        roleId: masterRole.id,
                        isActive: true,
                        isUserVerified: true,
                        tc: true,
                        accessUnit: [{ id: clientId }]
                    },
                ],
            );


            return res.status(statusCode.OK).send({
                message: message.lblEmployeeCreatedSuccess,
                data: { empId: newEmployee._id },
            });

        }

    } catch (error) {
        next(error);
    }
};

// update  
exports.update = async (req, res, next) => {

    try {
        const {
            clientId,
            employeeId,
            level,
            businessUnit,
            branch,
            warehouse,
            roleId,
            shift,
            department,
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

        const requiredFields = [firstName, lastName, email, phone, gender, level, roleId, shift,
            department,];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }


        const clientConnection = await getClientDatabaseConnection(clientId);
        const Role = clientConnection.model('clientRoles', clientRoleSchema);
        const role = await Role.findById(roleId);
        if (!role) {
            throw new CustomError(statusCode.Conflict, message.lblRoleNotFound);
        }

        // Base data object
        const dataObject = {
            firstName,
            lastName,
            email,
            phone,
            gender,
            role: roleId,
            roleId: role.id,
            shift: shift,
            workingDepartment: department,
            city,
            state,
            country,
            ZipCode,
            address,
            createdBy: mainUser._id,
        };

        let hashedPassword = "";
        if (password) {
            // Hash password
            hashedPassword = await bcrypt.hash(password, 10);
            dataObject.password = hashedPassword;
        }
        // Level-specific validation and assignment
        const levelConfig = {
            vendor: { isVendorLevel: true, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: false },
            business: { isVendorLevel: false, isBuLevel: true, isBranchLevel: false, isWarehouseLevel: false },
            branch: { isVendorLevel: false, isBuLevel: false, isBranchLevel: true, isWarehouseLevel: false },
            warehouse: { isVendorLevel: false, isBuLevel: false, isBranchLevel: false, isWarehouseLevel: true },
        };

        if (!levelConfig[level]) {
            return res.status(statusCode.BadRequest).send({ message: message.lblInvalidLevel });
        }

        Object.assign(dataObject, levelConfig[level]);

        if (['business', 'branch', 'warehouse'].includes(level) && !businessUnit) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBusinessUnitIdIdRequired });
        }

        if (['branch', 'warehouse'].includes(level) && !branch) {
            return res.status(statusCode.BadRequest).send({ message: message.lblBranchIdIdRequired });
        }

        if (level === 'warehouse' && !warehouse) {
            return res.status(statusCode.BadRequest).send({ message: message.lblWarehouseIdIdRequired });
        }

        // Add optional fields based on level
        if (businessUnit && businessUnit !== "null") {
            dataObject.businessUnit = businessUnit;
        }
        if (branch && branch !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
        }
        if (warehouse && warehouse !== "null") {
            dataObject.businessUnit = businessUnit;
            dataObject.branch = branch;
            dataObject.warehouse = warehouse;
        }

        // Add file icon if present
        // if (req.file?.filename) {
        //     dataObject.icon = req.file.filename;
        // }

        if (req.file) {
            const uploadResult = await uploadIconToS3(req.file, clientId);
            dataObject.profileImage = uploadResult.url;
            dataObject.iconKey = uploadResult.key; // Store S3 key for potential future deletion
        }

        // update 
        const updated = await employeeService.update(clientId, employeeId, dataObject);

        const existingStaff = await userModel.findOne({
            $or: [{ email: updated?.email.toLowerCase() }, { phone: updated?.phone }],
        });

        existingStaff.email = email;
        existingStaff.phone = phone;
        if (password) {
            existingStaff.password = hashedPassword;
        }
        await existingStaff.save();
        return res.status(statusCode.OK).send({
            message: message.lblEmployeeUpdatedSuccess,
        });

    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, employeeId } = req.params;
        if (!clientId || !employeeId) {
            return res.status(400).send({
                message: message.lblEmployeeIdAndClientIdRequired,
            });
        }
        const employee = await employeeService.getById(clientId, employeeId);
        return res.status(200).send({
            message: message.lblEmployeeFoundSucessfully,
            data: employee,
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
//         const result = await employeeService.list(clientId, filters, { page, limit: perPage });
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
        const { clientId, keyword = '', page = 1, perPage = 10, level = "vendor", levelId = "" } = req.query;
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({
                message: message.lblClinetIdIsRequired,
            });
        }
        let filters = {
            deletedAt: null,
            _id: { $ne: mainUser?._id },
            roleId: { $gt: 1, $ne: 0 },
            ...(keyword && {
                $or: [
                    { firstName: { $regex: keyword.trim(), $options: "i" } },
                    { lastName: { $regex: keyword.trim(), $options: "i" } },
                    { email: { $regex: keyword.trim(), $options: "i" } },
                    { phone: { $regex: keyword.trim(), $options: "i" } },
                ],
            }),
        };

        if (level == "vendor") {

        } else if (level == "business" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                businessUnit: levelId
            }
        } else if (level == "branch" && levelId) {
            filters = {
                ...filters,
                // isBranchLevel: true,
                branch: levelId
            }
        } else if (level == "warehouse" && levelId) {
            filters = {
                ...filters,
                // isBuLevel: true,
                isWarehouseLevel: levelId
            }
        }

        console.log("filters", filters);

        const result = await employeeService.list(clientId, filters, { page, limit: perPage });
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
                message: message.lblEmployeeIdIdAndClientIdRequired,
            });
        }
        const updated = await employeeService.activeInactive(clientId, id, {
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
        await employeeService.deleted(clientId, employeeId, softDelete = true)
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
        await employeeService.restore(clientId, branchId)
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
        const branch = await employeeService.getBranchByBusiness(clientId, businessUnitId);
        return res.status(200).send({
            message: message.lblBranchFoundSucessfully,
            data: branch,
        });
    } catch (error) {
        next(error)
    }
};




