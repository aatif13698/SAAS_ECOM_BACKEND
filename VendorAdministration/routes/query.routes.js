const express = require("express");  
let router = express.Router();  

const queryController = require("../controller/query.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  



router.get('/list/query', entityAuth.authorizeEntity("Administration", "Employee", "create"), queryController.listQaOut);  

router.get('/get/query/:clientId/:id', entityAuth.authorizeEntity("Administration", "Employee", "create"), queryController.getQueryById);  

router.put('/update/query', entityAuth.authorizeEntity("Administration", "Employee", "update"), queryController.updateQuery);  


exports.router = router;  