

const express = require("express");
let router = express.Router();



const supplierTransportController = require("../controller/supplierTransport.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");




router.post('/create/supplier/transport', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierTransportController.create);

router.post('/update/supplier/transport', entityAuth.authorizeEntity("Inventory", "Supplier", "update"), supplierTransportController.update);

router.get('/get/supplier/transport/:clientId/:transportId', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierTransportController.getParticular);

router.get('/list/supplier/transport', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierTransportController.list);

router.post("/activeInactive/transport", entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierTransportController.activeinactive);


exports.router = router;
