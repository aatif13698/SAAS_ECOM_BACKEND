



const clientRoleSchema = require("../../client/model/role");
const { getClientDatabaseConnection } = require("../../db/connection");
const roleModel = require("../../model/role");
const userModel = require("../../model/user");
const CustomError = require("../../utils/customeError");
const statusCode = require("../../utils/http-status-code");
const message = require("../../utils/message");
const shiftService = require("../services/shift.service");
const bcrypt = require("bcrypt")



exports.create = async (req, res, next) => {
    try {
        const {
            clientId,
            level,
            businessUnit,
            branch,
            warehouse,

            shiftName,
            startTime,
            endTime,
            shiftType,
            status,
            requiredEmployees,
            notes,
            recurring,
            isApproved,
        } = req.body;

        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [shiftName, startTime, endTime, shiftType, status, requiredEmployees, level, notes, recurring];
        console.log("requiredFields", requiredFields);

        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        // Base data object
        const dataObject = {
            shiftName,
            startTime,
            endTime,
            shiftType,
            status,
            requiredEmployees,
            notes,
            recurring,
            isApproved,
            createdBy: mainUser._id,
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

        const newShift = await shiftService.create(clientId, dataObject);
        return res.status(statusCode.OK).send({
            message: message.lblShiftCreatedSuccess,
            data: { shiftId: newShift._id },
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
            shiftId,
            level,
            businessUnit,
            branch,
            warehouse,

            shiftName,
            startTime,
            endTime,
            shiftType,
            status,
            requiredEmployees,
            notes,
            recurring,
            isApproved,
        } = req.body;

        console.log("warehouse", warehouse);


        const mainUser = req.user;

        // Validate required fields
        if (!clientId) {
            return res.status(statusCode.BadRequest).send({ message: message.lblClinetIdIsRequired });
        }

        const requiredFields = [
            shiftName,
            startTime,
            endTime,
            shiftType,
            status,
            requiredEmployees,
            notes,
            recurring];
        if (requiredFields.some((field) => !field)) {
            return res.status(statusCode.BadRequest).send({ message: message.lblRequiredFieldMissing });
        }

        
        // Base data object
        const dataObject = {
            shiftName,
            startTime,
            endTime,
            shiftType,
            status,
            requiredEmployees,
            notes,
            recurring,
            isApproved,
            createdBy: mainUser._id,
        };
        
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

        // update 
        const updated = await shiftService.update(clientId, shiftId, dataObject);
       
        await existingStaff.save();
        return res.status(statusCode.OK).send({
            message: message.lblShiftUpdatedSuccess,
        });

    } catch (error) {
        next(error);
    }

};

// get particular 
exports.getParticular = async (req, res, next) => {
    try {
        const { clientId, shiftId } = req.params;
        if (!clientId || !shiftId) {
            return res.status(400).send({
                message: message.lblShiftIdAndClientIdRequired,
            });
        }
        const shift = await shiftService.getById(clientId, shiftId);
        return res.status(200).send({
            message: message.lblShiftFoundSucessfully,
            data: employee,
        });
    } catch (error) {
        next(error)
    }
};


// list
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
                    { shiftName: { $regex: keyword.trim(), $options: "i" } },
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

        const result = await shiftService.list(clientId, filters, { page, limit: perPage });
        return res.status(statusCode.OK).send({
            message: message.lblShiftFoundSucessfully,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

// active inactive
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
        const updated = await shiftService.activeInactive(clientId, id, {
            isActive: status == "1",
        });
        this.list(req, res, next)
    } catch (error) {
        next(error);
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




