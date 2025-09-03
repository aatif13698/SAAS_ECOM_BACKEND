

const express = require("express");
let router = express.Router();



const workingDepartmentController = require("../controller/workingDepartment.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/workingDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), workingDepartmentController.create);

router.put('/update/workingDepartment', entityAuth.authorizeEntity("Administration", "Employee", "update"), workingDepartmentController.update);

router.get('/shift/:clientId/:workingDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), workingDepartmentController.getParticular);

router.get('/list/workingDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), workingDepartmentController.list);

router.post("/activeInactive/workingDepartment", entityAuth.authorizeEntity("Administration", "Employee", "create"), workingDepartmentController.activeinactive);

// # create, update, view, list, activate/inactive  woring department






exports.router = router;
