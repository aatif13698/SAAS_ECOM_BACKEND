const express = require("express");
let router = express.Router();


const purchaseInvoiceController = require("../controller/purchaseInvoice.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive purchaseInvoice 

router.post('/create/purchaseInvoice', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.create);

router.get('/get/audit/purchaseInvoice/:clientId/:purchaseOrderId', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "view"), purchaseInvoiceController.getAuditPurchaseInvoice);

router.post('/audit/item/purchaseInvoice', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.auditItem);




router.post('/issue/purchaseInvoice/mail', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.issueMail);

router.put('/update/purchaseInvoice', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.update);

router.get('/get/:clientId/:purchaseOrderId', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.getParticular);

router.get('/list/purchaseInvoice', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.list);

router.get('/unpaid/purchaseInvoice', entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.unpaidInvoices);

router.post("/change/status/purchaseInvoice", entityAuth.authorizeEntity("Purchases", "Purchase Invoices", "create"), purchaseInvoiceController.changeStatus);


exports.router = router; 