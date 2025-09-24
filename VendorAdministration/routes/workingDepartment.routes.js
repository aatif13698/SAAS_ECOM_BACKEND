

const express = require("express");
let router = express.Router();



const workingDepartmentController = require("../controller/workingDepartment.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/workingDepartment', entityAuth.authorizeEntity("Administration", "Department", "create"), workingDepartmentController.create);

router.put('/update/workingDepartment', entityAuth.authorizeEntity("Administration", "Department", "update"), workingDepartmentController.update);

router.get('/shift/:clientId/:workingDepartment', entityAuth.authorizeEntity("Administration", "Department", "create"), workingDepartmentController.getParticular);

router.get('/list/workingDepartment', entityAuth.authorizeEntity("Administration", "Department", "create"), workingDepartmentController.list);

router.get('/all/workingDepartment', entityAuth.authorizeEntity("Administration", "Department", "create"), workingDepartmentController.allDepartment);

router.post("/activeInactive/workingDepartment", entityAuth.authorizeEntity("Administration", "Department", "create"), workingDepartmentController.activeinactive);

// # create, update, view, list, activate/inactive  woring department






exports.router = router;
