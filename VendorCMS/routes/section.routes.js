

const express = require("express");
let router = express.Router();



const sectionController = require("../controller/section.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive 

router.post('/create/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.create);

router.get('/list/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.list);

router.post("/activeInactive/section", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.activeinactive);

router.put('/update/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), sectionController.update);

router.get('/get/all/section/cardtypes/:clientId', sectionController.sectionTypes);


// # create, update, view, list, activate/inactive


exports.router = router;
