const express = require("express"); 
let router = express.Router(); 


const leaveAllotmentController = require("../controller/leaveAllotment.controller"); 
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization"); 
const { uploadBranchIcon } = require("../../utils/multer"); 


// # create, update, view, list, activate/inactive leave category 

router.post('/create/leave/allotment', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.create); 

router.put('/update/leave/allotment', entityAuth.authorizeEntity("Administration", "Employee", "update"), leaveAllotmentController.update); 

router.get('/get/:clientId/:leave/allotment', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveAllotmentController.getParticular); 

exports.router = router; 