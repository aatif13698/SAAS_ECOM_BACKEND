const express = require("express"); 
let router = express.Router(); 


const dashboardController = require("../controller/dashboard.controller"); 
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization"); 
const { uploadBranchIcon } = require("../../utils/multer"); 



router.get('/get/counts/:clientId', entityAuth.authorizeEntity("Administration", "Employee", "create"), dashboardController.getCounts); 




exports.router = router; 