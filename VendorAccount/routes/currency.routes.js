

const express = require("express");
let router = express.Router();



const currencyController = require("../controller/currency.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive Currency

router.post('/create/financialYear', entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.create);

router.get('/list/financialYear', entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.list);

router.post("/activeInactive/financialYear", entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.activeinactive);

router.put('/update/financialYear', entityAuth.authorizeEntity("Accounting Master", "Currency", "update"), currencyController.update);


// # create, update, view, list, activate/inactive Currency


exports.router = router;
