const express = require("express");
let router = express.Router();


const quotationController = require("../controller/quotation.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive quotation 

router.post('/create/quotation', entityAuth.authorizeEntity("Administration", "Employee", "create"), quotationController.create);

router.post('/issue/quotation/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), quotationController.issueMail);

router.put('/update/quotation', entityAuth.authorizeEntity("Administration", "Employee", "update"), quotationController.update);

router.get('/get/:clientId/:quotationId', entityAuth.authorizeEntity("Administration", "Employee", "create"), quotationController.getParticular);

router.get('/list/quotation', entityAuth.authorizeEntity("Administration", "Employee", "create"), quotationController.list);

router.post("/change/status/quotation", entityAuth.authorizeEntity("Administration", "Employee", "create"), quotationController.changeStatus);


exports.router = router; 