

const express = require("express");
let router = express.Router();



const currencyController = require("../controller/currency.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive Currency

router.post('/create/currency', entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.create);

router.get('/list/currency', entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.list);

router.post("/activeInactive/currency", entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.activeinactive);

router.put('/update/currency', entityAuth.authorizeEntity("Accounting Master", "Currency", "update"), currencyController.update);

router.get('/all/currency', entityAuth.authorizeEntity("Accounting Master", "Currency", "create"), currencyController.all);


// # create, update, view, list, activate/inactive Currency


exports.router = router;
