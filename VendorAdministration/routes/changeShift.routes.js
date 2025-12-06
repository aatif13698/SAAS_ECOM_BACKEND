const express = require("express");  
let router = express.Router();  

const changeShiftController = require("../controller/changeShift.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  
const { uploadBranchIcon } = require("../../utils/multer");  

// # create, update, view, list, activate/inactive, delete change shifts  

router.post('/create/changeShift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), changeShiftController.create);  

router.get('/list/changeShift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), changeShiftController.list);  

router.put('/update/changeShift', entityAuth.authorizeEntity("Human resources", "Shift", "update"), changeShiftController.update);  

router.post("/activeInactive/changeShift", entityAuth.authorizeEntity("Human resources", "Shift", "create"), changeShiftController.activeinactive);  


// # create, update, view, list, activate/inactive change shifts  

exports.router = router;  