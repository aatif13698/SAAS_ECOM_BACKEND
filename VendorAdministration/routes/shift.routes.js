

const express = require("express");
let router = express.Router();



const shiftController = require("../controller/shift.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete shifts

router.post('/create/shift', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.create);
















router.put('/updateEmployee', entityAuth.authorizeEntity("Administration", "Employee", "update"), shiftController.update);

router.get('/employee/:clientId/:employeeId', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.getParticular);

router.get('/listEmployee', entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.list);

router.post("/activeInactiveEmployee", entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.activeinactive);

router.post("/softDeleteEmployee", entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.softDelete);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Employee", "create"), shiftController.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "Branch", "create"), shiftController.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
