const express = require("express");
let router = express.Router();


const purchaseInvoiceController = require("../controller/purchaseInvoice.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive purchaseInvoice 

router.post('/create/purchaseInvoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.create);

router.get('/get/audit/purchaseInvoice/:clientId/:purchaseOrderId', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.getAuditPurchaseInvoice);


router.post('/issue/purchaseInvoice/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.issueMail);

router.put('/update/purchaseInvoice', entityAuth.authorizeEntity("Administration", "Employee", "update"), purchaseInvoiceController.update);

router.get('/get/:clientId/:purchaseOrderId', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.getParticular);

router.get('/list/purchaseInvoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.list);

router.get('/unpaid/purchaseInvoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.unpaidInvoices);

router.post("/change/status/purchaseInvoice", entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseInvoiceController.changeStatus);


exports.router = router; 