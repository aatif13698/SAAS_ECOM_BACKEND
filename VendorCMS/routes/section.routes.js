

const express = require("express");
let router = express.Router();



const sectionController = require("../controller/section.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive 

router.post('/create/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.create);

router.get('/list/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.list);

router.post("/activeInactive/section", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.activeinactive);

router.post('/update/section', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), sectionController.update);

router.get('/get/all/section/cardtypes/:clientId', sectionController.sectionTypes);

router.post('/arraneg/order', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), sectionController.updateSectionOrders); // or POST if you prefer

router.get('/get/section/by/id/:clientId/:id', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), sectionController.sectionById);


// # create, update, view, list, activate/inactive


exports.router = router;
