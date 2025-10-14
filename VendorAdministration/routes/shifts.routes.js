

const express = require("express");
let router = express.Router();



const shiftController = require("../controller/shifts.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete shifts

router.post('/create/shift', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.create);

router.get('/list/shift', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.list);

router.put('/update/shift', entityAuth.authorizeEntity("Administration", "Employee", "update"), shiftController.update);

router.post("/activeInactive/shift", entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.activeinactive);




// router.get('/shift/:clientId/:shiftId', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.getParticular);



// # create, update, view, list, activate/inactive shifts






exports.router = router;
