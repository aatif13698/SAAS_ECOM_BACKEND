

const express = require("express");
let router = express.Router();



const holidayController = require("../controller/holiday.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive holiday

router.post('/create/holiday', entityAuth.authorizeEntity("Administration", "Employee", "create"), holidayController.create);

router.put('/update/holiday', entityAuth.authorizeEntity("Administration", "Employee", "update"), holidayController.update);

router.get('/get/:clientId/:holiday', entityAuth.authorizeEntity("Administration", "Employee", "create"), holidayController.getParticular);

router.get('/list/holiday', entityAuth.authorizeEntity("Administration", "Employee", "create"), holidayController.list);

router.post("/activeInactive/holiday", entityAuth.authorizeEntity("Administration", "Employee", "create"), holidayController.activeinactive);

router.post('/create/holiday/request', entityAuth.authorizeEntity("Administration", "Employee", "create"), holidayController.createRequest );


exports.router = router;
