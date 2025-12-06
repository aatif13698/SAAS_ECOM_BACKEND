const express = require("express");  
let router = express.Router();  

const requestShiftController = require("../controller/requestShift.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  
const { uploadBranchIcon } = require("../../utils/multer");  

// # create, update, view, list, activate/inactive, delete change shifts  


router.get('/list/requestShift', entityAuth.authorizeEntity("Human resources", "Shift", "create"), requestShiftController.list);  

router.put('/update/requestShift', entityAuth.authorizeEntity("Human resources", "Shift", "update"), requestShiftController.update);  

router.post("/activeInactive/requestShift", entityAuth.authorizeEntity("Human resources", "Shift", "create"), requestShiftController.activeinactive);  


// # create, update, view, list, activate/inactive change shifts  

exports.router = router;  