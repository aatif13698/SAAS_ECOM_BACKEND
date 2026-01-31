const express = require("express");
let router = express.Router();


const invoiceController = require("../controller/saleInvoice.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive invoice 

router.post('/create/invoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), invoiceController.create);

router.post('/issue/invoice/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), invoiceController.issueMail);

router.put('/update/invoice', entityAuth.authorizeEntity("Administration", "Employee", "update"), invoiceController.update);

router.get('/get/:clientId/:invoiceId', entityAuth.authorizeEntity("Administration", "Employee", "create"), invoiceController.getParticular);

router.get('/list/invoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), invoiceController.list);

router.post("/change/status/invoice", entityAuth.authorizeEntity("Administration", "Employee", "create"), invoiceController.changeStatus);


exports.router = router; 