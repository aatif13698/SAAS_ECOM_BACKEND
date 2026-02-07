const express = require("express");
let router = express.Router();


const transactionSeriesController = require("../controller/transactionSeries.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


router.get('/get/all/:clientId/:year', entityAuth.authorizeEntity("Administration", "Employee", "create"), transactionSeriesController.getAllSeries);


exports.router = router; 