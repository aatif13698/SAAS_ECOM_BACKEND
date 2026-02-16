


const transactionSeriesService = require("../service/transactionSeries.service");
const { getClientDatabaseConnection } = require("../../db/connection");
const transactionSerialNumebrSchema = require("../../client/model/transactionSeries");
const { default: mongoose } = require("mongoose");
const httpStatusCode = require("../../utils/http-status-code");
const CustomError = require("../../utils/customeError");
const financialYearSchema = require("../../client/model/financialYear");

exports.getAllSeries = async (req, res, next) => {
    try {
        const { clientId, year } = req.params;
        if (!clientId) {
            return res.status(400).send({
                message: "Client id is required.",
            });
        }
        const series = await transactionSeriesService.getAllSeries(clientId, year);
        return res.status(200).send({
            message: "series found successfully",
            data: series,
        });
    } catch (error) {
        next(error)
    }
};

exports.getSeriesNextValue = async (req, res, next) => {
    try {
        const { clientId, year, collectionName } = req.params;
        if (!clientId) {
            return res.status(400).send({
                message: "Client id is required.",
            });
        }
        const series = await transactionSeriesService.getSeriesNextValue(clientId, year, collectionName);
        return res.status(200).send({
            message: "series found successfully",
            data: series,
        });
    } catch (error) {
        next(error)
    }
};

exports.create = async (req, res, next) => {
    try {

        const { clientId, financialYear, series } = req.body;

        if (!clientId) {
            return res.status(400).send({
                message: "Client id is required.",
            });
        }

        // Validate payload
        if (!financialYear || !Array.isArray(series) || series.length === 0) {
            throw new CustomError(httpStatusCode.BadRequest, "Invalid payload: financialYear and series array are required");
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
        const FinancialYear = clientConnection.model("financialYear", financialYearSchema);

        // Check if any series already exists for this year
        const existing = await SerialNumber.findOne({ year: financialYear });
        if (existing) {
            throw new CustomError(httpStatusCode.BadRequest, `Transaction series already exists for financial year ${financialYear}`);

        }
        // Prepare documents
        const documents = series.map(item => ({
            year: financialYear,
            collectionName: item.collectionName,
            prefix: item.prefix.trim().toUpperCase(),
            nextNum: Number(item.nextNum)
        }));


        // Bulk insert (very fast)
        const result = await SerialNumber.insertMany(documents);

        await FinancialYear.findOneAndUpdate(
            { name: financialYear },
            { $set: { isSeriesCreated: true } },
        );

        return res.status(200).json({
            success: true,
            message: `Transaction series created successfully for ${financialYear}`,
            count: result.length,
            data: result
        });

    } catch (error) {
        next(error)
    }
};


exports.update = async (req, res, next) => {
    try {
        const { clientId, updates } = req.body;
        if (!clientId) {
            return res.status(400).send({
                message: "Client id is required.",
            });
        }

        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({ error: "Request body must be a non-empty array" });
        }

        const incomingPrefixes = updates
            .map(item => item.prefix?.trim().toUpperCase())
            .filter(Boolean);

        const uniquePrefixes = new Set(incomingPrefixes);
        if (uniquePrefixes.size !== incomingPrefixes.length) {
            return res.status(400).json({
                error: "Same prefix exists in the request data",
                message: "Duplicate prefixes found in your bulk payload"
            });
        }

        const clientConnection = await getClientDatabaseConnection(clientId);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);

        const bulkOps = updates.map(item => ({
            updateOne: {
                filter: { _id: item._id },
                update: {
                    $set: {
                        collectionName: item.collectionName,
                        year: item.year,
                        prefix: item.prefix?.trim().toUpperCase(),
                        nextNum: item.nextNum
                    }
                },
                upsert: false
            }
        }));

        const result = await SerialNumber.bulkWrite(bulkOps);

        return res.status(200).json({
            success: true,
            message: "Bulk update completed successfully",
            modifiedCount: result.modifiedCount,
            matchedCount: result.matchedCount,
        });
    } catch (error) {
        next(error)
    }
};


exports.getUniqueSerialYear = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).send({
                message: "Client id is required.",
            });
        }
        const clientConnection = await getClientDatabaseConnection(clientId);
        const SerialNumber = clientConnection.model('transactionSerialNumebr', transactionSerialNumebrSchema);
        let years = await SerialNumber.distinct('year');
        // Sort descending (newest year first) - looks professional in UI
        years.sort((a, b) => b.localeCompare(a));
        return res.status(200).send({
            success: true,
            count: years.length,
            data: years
        });
    } catch (error) {
        next(error)
    }
};

