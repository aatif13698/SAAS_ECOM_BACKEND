


const  transactionSeriesService  = require("../service/transactionSeries.service")
exports.getAllSeries = async (req, res, next) => {
    try {
        const { clientId, year } = req.params;
        if (!clientId ) {
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