const financialYearSchema = require("../../client/model/financialYear");
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");
const { getClientDatabaseConnection } = require("../../db/connection");
const CustomError = require("../../utils/customeError");
const httpStatusCode = require("../../utils/http-status-code");


function getFiscalYearRange(date) {
    const year = date.getFullYear();
    const nextYear = year + 1;
    const nextYearShort = nextYear % 100; // Gets the last two digits
    return `${year}-${nextYearShort.toString().padStart(2, '0')}`; // Ensures two digits, e.g., 2025-26
}

const getAllSeries = async (clientId, year) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
        const currentDate = new Date();
        const financialYear = getFiscalYearRange(currentDate);
        const series = await SerialNumber.find({ year: year });
        if (series.length == 0) {
            throw new CustomError(httpStatusCode.NotFound, "Series not found.");
        }
        return series;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};

const getSeriesNextValue = async (clientId, year, collectionName) => {
    try {
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);
        const financialYear = await FinancialYear.findOne({ isWorking: true });
        if (!financialYear) {
            throw new CustomError(httpStatusCode.NotFound, "No working finanacial year has been set yet.");
        }
        const series = await SerialNumber.findOne({ year: financialYear.name, collectionName: collectionName });
        if (series.length == 0) {
            throw new CustomError(httpStatusCode.NotFound, "Series not found.");
        }
        return series;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error: ${error.message}`);
    }
};



module.exports = {
    getAllSeries,
    getSeriesNextValue
}