const express = require("express");
let router = express.Router();


const purchaseReturnController = require("../controller/purchaseReturn.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive purchaseReturn 

router.post('/create/purchaseReturn', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseReturnController.create);

router.post('/issue/purchaseReturn/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseReturnController.issueMail);

router.put('/update/purchaseReturn', entityAuth.authorizeEntity("Administration", "Employee", "update"), purchaseReturnController.update);

router.get('/get/:clientId/:purchaseReturn', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseReturnController.getParticular);

router.get('/list/purchaseReturn', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseReturnController.list);

router.post("/change/status/purchaseReturn", entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseReturnController.changeStatus);


exports.router = router; 