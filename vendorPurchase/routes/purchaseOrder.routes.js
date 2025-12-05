const express = require("express");
let router = express.Router();


const purchaseOrderController = require("../controller/purchaseOrder.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive purchaseOrder 

router.post('/create/purchaseOrder', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseOrderController.create);

router.post('/issue/purchaseOrder/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseOrderController.issueMail);

router.put('/update/purchaseOrder', entityAuth.authorizeEntity("Administration", "Employee", "update"), purchaseOrderController.update);

router.get('/get/:clientId/:purchaseOrder', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseOrderController.getParticular);

router.get('/list/purchaseOrder', entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseOrderController.list);

router.post("/change/status/purchaseOrder", entityAuth.authorizeEntity("Administration", "Employee", "create"), purchaseOrderController.changeStatus);


exports.router = router; 