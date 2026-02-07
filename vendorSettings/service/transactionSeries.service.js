const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");
const { getClientDatabaseConnection } = require("../../db/connection");


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
        const series = await SerialNumber.find({ year: financialYear });
        if (!series) {
            throw new CustomError(statusCode.NotFound, "series not found.");
        }
        return series;
    } catch (error) {
        throw new CustomError(error.statusCode || 500, `Error getting: ${error.message}`);
    }
};



module.exports = {
    getAllSeries,
}