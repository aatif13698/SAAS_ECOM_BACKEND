

const express = require("express");
let router = express.Router();



const statementController = require("../controller/statement.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive 

router.post('/create/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.create);

router.get('/list/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.list);

router.post("/activeInactive/statement", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.activeinactive);

router.put('/update/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), statementController.update);

router.get('/get/statement/:clientId/:type', statementController.statementType);


// # create, update, view, list, activate/inactive


exports.router = router;
