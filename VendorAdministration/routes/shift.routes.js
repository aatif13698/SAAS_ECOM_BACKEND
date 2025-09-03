

const express = require("express");
let router = express.Router();



const shiftController = require("../controller/shift.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete shifts

router.post('/create/shift', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.create);

router.put('/update/shift', entityAuth.authorizeEntity("Administration", "Employee", "update"), shiftController.update);

router.get('/shift/:clientId/:shiftId', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.getParticular);

router.get('/list/shift', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.list);

router.post("/activeInactive/shift", entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.activeinactive);

// # create, update, view, list, activate/inactive shifts






exports.router = router;
