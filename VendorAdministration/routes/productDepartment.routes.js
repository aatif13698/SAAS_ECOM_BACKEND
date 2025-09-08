

const express = require("express");
let router = express.Router();



const productDepartmentController = require("../controller/productDepartment.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/productDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), productDepartmentController.create);

router.put('/update/productDepartment', entityAuth.authorizeEntity("Administration", "Employee", "update"), productDepartmentController.update);

router.get('/shift/:clientId/:productDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), productDepartmentController.getParticular);

router.get('/list/productDepartment', entityAuth.authorizeEntity("Administration", "Employee", "create"), productDepartmentController.list);

router.post("/activeInactive/productDepartment", entityAuth.authorizeEntity("Administration", "Employee", "create"), productDepartmentController.activeinactive);

// # create, update, view, list, activate/inactive  woring department






exports.router = router;
