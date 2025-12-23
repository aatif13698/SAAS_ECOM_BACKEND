// services/chairService.js 
const { getClientDatabaseConnection } = require("../../db/connection");
const message = require("../../utils/message");
const statusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const clientAssetSchema = require("../../client/model/asset");
const holidaySchema = require("../../client/model/holiday");
const { DateTime } = require("luxon");


const create = async (clientId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Holiday = clientConnection.model('holiday', holidaySchema);
        return await Holiday.create(data);
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error creating leave category : ${error.message}`);
    }
};

const update = async (clientId, holidayId, updateData) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Holiday = clientConnection.model('holiday', holidaySchema);
        const holiday = await Holiday.findById(holidayId);
        if (!holiday) {
            throw new CustomError(statusCode.NotFound, message.lblHolidayNotFound);
        }
        Object.assign(holiday, updateData);
        await holiday.save();
        return holiday
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error updating holiday: ${error.message}`);
    }
};


const getById = async (clientId, holidayId) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Holiday = clientConnection.model('holiday', holidaySchema);
        const holiday = await Holiday.findById(holidayId);
        if (!holiday) {
            throw new CustomError(statusCode.NotFound, message.lblHolidayNotFound);
        }
        return holiday;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting holiday: ${error.message}`);
    }
};


const list = async (clientId, filters = {}, options = { page: 1, limit: 10 }) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Holiday = clientConnection.model('holiday', holidaySchema);
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const [holidays, total] = await Promise.all([
            Holiday.find(filters).skip(skip),
            Holiday.countDocuments(filters),
        ]);
        const formatedHoliday = holidays?.map((item) => {
            return {
                _id: item._id,
                businessUnit: item.businessUnit,
                branch: item.branch,
                warehouse: item.warehouse,
                isVendorLevel: item.isVendorLevel,
                isBuLevel: item.isBuLevel,
                isBranchLevel: item.isBranchLevel,
                isWarehouseLevel: item.isWarehouseLevel,
                name: item.name,
                code: item.code,
                description: item.description,
                isHalfDay: item.isHalfDay,
                isActive: item.isActive,
                createdBy: item.createdBy,
                deletedAt: item.deletedAt,
                startDate: DateTime.fromJSDate(item.startDate).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd'),
                endDate: DateTime.fromJSDate(item.endDate).setZone('Asia/Kolkata').toFormat('yyyy-MM-dd')
            }
        });
        return { count: total, holidays: formatedHoliday };
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error listing: ${error.message}`);
    }
};


const activeInactive = async (clientId, holidayId, data) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const Holiday = clientConnection.model('holiday', holidaySchema);
        const holiday = await Holiday.findById(holidayId);
        if (!holiday) {
            throw new CustomError(statusCode.NotFound, message.lblHolidayNotFound);
        }
        Object.assign(holiday, data);
        return await holiday.save();
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error active inactive: ${error.message}`);
    }
};


module.exports = {
    create,
    update,
    getById,
    list,
    activeInactive,
}; 