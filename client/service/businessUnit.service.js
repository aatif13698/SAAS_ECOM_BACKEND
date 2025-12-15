// services/chairService.js
const { getClientDatabaseConnection } = require("../../db/connection");
const clinetBusinessUnitSchema = require("../../client/model/businessUnit")
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const { generateLedgerGroup } = require("../../helper/accountingHelper");


const create = async (clientId, data, mainUser) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const existing = await BusinessUnit.findOne({
            $or: [{ emailContact: data.emailContact },
            { contactNumber: data?.contactNumber }
            ],
        });

        if (existing) {
            throw new CustomError(statusCode.Conflict, message.lblBusinessUnitAlreadyExists);
        }

        const newBusiness =  await BusinessUnit.create(data);
        
        await generateLedgerGroup(newBusiness._id, null, null, "business", mainUser, clientId);

        return newBusiness;

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating business unit: ${error.message}`);
    }
};

const update = async (clientId, businessUnitId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const businessUnit = await BusinessUnit.findById(businessUnitId);
        if (!businessUnit) {
            throw new CustomError(statusCode.NotFound, message.lblBusinessUnitNotFound);
        }
        if (data.emailContact && data.emailContact !== businessUnit.emailContact) {
            const emailConflict = await BusinessUnit.exists({
                _id: { $ne: businessUnitId },
                emailContact: data.emailContact,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblEmailAlreadyExists);
            }
        }
        if (data.contactNumber && data.contactNumber !== businessUnit.contactNumber) {
            const emailConflict = await BusinessUnit.exists({
                _id: { $ne: businessUnitId },
                contactNumber: data.contactNumber,
            });
            if (emailConflict) {
                throw new CustomError(statusCode.Conflict, message.lblPhoneAlreadyExists);
            }
        }
        Object.assign(businessUnit, data);
        return await businessUnit.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating business unit: ${error.message}`);
    }
};

const getById = async (clientId, businessUnitId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const businessUnit = await BusinessUnit.findById(businessUnitId);
        if (!businessUnit) {
            throw new CustomError(statusCode.NotFound, message.lblBusinessUnitNotFound);
        }
        return businessUnit;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting business unit: ${error.message}`);
    }
};

const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);

        const { page, limit } = options;
        const skip = (page - 1) * limit;

        const [businessUnits, total] = await Promise.all([
            BusinessUnit.find(filters).skip(skip).limit(limit).sort({ _id: -1 }),
            BusinessUnit.countDocuments(filters),
        ]);

        return { count: total, businessUnits };

    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing business unit: ${error.message}`);

    }
};

const getAllActive = async (clientId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const [businessUnits] = await Promise.all([
            BusinessUnit.find({isActive : true, deletedAt : null}).sort({ _id: -1 }),
        ]);
        return { businessUnits };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing business unit: ${error.message}`);
    }
};



const activeInactive = async (clientId, businessUnitId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const businessUnit = await BusinessUnit.findById(businessUnitId);
        if (!businessUnit) {
            throw new CustomError(statusCode.NotFound, message.lblBusinessUnitNotFound);
        }
        Object.assign(businessUnit, data);
        return await businessUnit.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive business unit: ${error.message}`);
    }
};

const deleted = async (clientId, businessUnitId, softDelete = true) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const businessUnit = await BusinessUnit.findById(businessUnitId);
        if (!businessUnit) {
            throw new CustomError(statusCode.NotFound, message.lblBusinessUnitNotFound);
        }
        if (softDelete) {
            businessUnit.deletedAt = new Date();
            await businessUnit.save();
        } else {
            await businessUnit.remove();
        }
        return businessUnit;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete business unit: ${error.message}`);
    }
};

const restore = async (clientId, businessUnitId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const BusinessUnit = clientConnection.model('businessUnit', clinetBusinessUnitSchema);
        const businessUnit = await BusinessUnit.findById(businessUnitId);
        if (!businessUnit) {
            throw new CustomError(statusCode.NotFound, message.lblChairNotFound);
        }
        businessUnit.deletedAt = null;
        await businessUnit.save();
        return businessUnit;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error soft delete business unit: ${error.message}`);
    }
};

module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
    deleted,
    restore,
    getAllActive
};
