const express = require("express"); 
let router = express.Router(); 


const leaveAllotmentController = require("../controller/leaveCategories.controller"); 
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization"); 
const { uploadBranchIcon } = require("../../utils/multer"); 


// # create, update, view, list, activate/inactive leave category 

router.post('/create/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.create); 

router.put('/update/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "update"), leaveAllotmentController.update); 

router.get('/get/:clientId/:leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.getParticular); 

router.get('/list/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.list); 

router.post("/activeInactive/leave/category", entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.activeinactive); 


exports.router = router; 