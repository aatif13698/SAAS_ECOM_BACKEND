const express = require("express");
let router = express.Router();


const saleReturnController = require("../controller/saleReturn.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive saleReturn 

router.post('/create/saleReturn', entityAuth.authorizeEntity("Administration", "Employee", "create"), saleReturnController.create);

router.post('/issue/saleReturn/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), saleReturnController.issueMail);

router.put('/update/saleReturn', entityAuth.authorizeEntity("Administration", "Employee", "update"), saleReturnController.update);

router.get('/get/:clientId/:saleReturnId', entityAuth.authorizeEntity("Administration", "Employee", "create"), saleReturnController.getParticular);

router.get('/list/saleReturn', entityAuth.authorizeEntity("Administration", "Employee", "create"), saleReturnController.list);

router.post("/change/status/saleReturn", entityAuth.authorizeEntity("Administration", "Employee", "create"), saleReturnController.changeStatus);


exports.router = router; 