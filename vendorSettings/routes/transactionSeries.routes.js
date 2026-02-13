const express = require("express");
let router = express.Router();


const transactionSeriesController = require("../controller/transactionSeries.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


router.get('/get/all/:clientId/:year', entityAuth.authorizeEntity("Administration", "Employee", "create"), transactionSeriesController.getAllSeries);

router.get('/get/series/next/value/:clientId/:year/:collectionName', entityAuth.authorizeEntity("Administration", "Employee", "create"), transactionSeriesController.getSeriesNextValue)

router.post('/create/serial', entityAuth.authorizeEntity("Administration", "Employee", "create"), transactionSeriesController.create);

router.post('/update/serial', entityAuth.authorizeEntity("Administration", "Employee", "create"), transactionSeriesController.update);


exports.router = router; 