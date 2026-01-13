const express = require("express"); 
let router = express.Router(); 


const leaveCategoryController = require("../controller/leaveCategories.controller"); 
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization"); 
const { uploadBranchIcon } = require("../../utils/multer"); 


// # create, update, view, list, activate/inactive leave category 

router.post('/create/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.create); 

router.put('/update/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "update"), leaveCategoryController.update); 

router.get('/get/:clientId/:leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.getParticular); 

router.get('/list/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.list); 

router.get('/all/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.all); 

router.post("/activeInactive/leave/category", entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.activeinactive); 

router.get('/all/leave/balance', leaveCategoryController.allLeaveBalance);

router.get('/all/leave/history', leaveCategoryController.allLeaveHistory); 

router.post('/apply/leave', leaveCategoryController.applyLeave); 

router.get('/leave/requests',entityAuth.authorizeEntity("Human resources", "Leave Requests", "create"), leaveCategoryController.listLeaveRequests);



exports.router = router; 