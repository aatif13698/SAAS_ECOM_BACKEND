

const express = require("express");
let router = express.Router();



const leaveCategoryController = require("../controller/leaveCategory.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive leave category

router.post('/create/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.create);

router.put('/update/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "update"), leaveCategoryController.update);

router.get('/get/:clientId/:leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.getParticular);

router.get('/list/leave/category', entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.list);

router.post("/activeInactive/leave/category", entityAuth.authorizeEntity("Administration", "Employee", "create"), leaveCategoryController.activeinactive);



exports.router = router;
