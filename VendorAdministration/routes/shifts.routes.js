const express = require("express");  
let router = express.Router();  

const shiftController = require("../controller/shifts.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  
const { uploadBranchIcon } = require("../../utils/multer");  

// # create, update, view, list, activate/inactive, delete shifts  

router.post('/create/shift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), shiftController.create);  

router.get('/list/shift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), shiftController.list);  

router.put('/update/shift', entityAuth.authorizeEntity("Human resources", "Shift", "update"), shiftController.update);  

router.post("/activeInactive/shift", entityAuth.authorizeEntity("Human resources", "Shift", "create"), shiftController.activeinactive);  

router.get('/all/shift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), shiftController.allShift);  


// router.get('/shift/:clientId/:shiftId', entityAuth.authorizeEntity("Human resources", "Shift", "create"), shiftController.getParticular);  

// # create, update, view, list, activate/inactive shifts  

exports.router = router;  