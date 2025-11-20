

const express = require("express");
let router = express.Router();



const supplierContrller = require("../controller/supplier.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete

// router.post('/createBranch', entityAuth.authorizeEntity("Supplier", "create"), supplierContrller.createBranchByVendor);

router.post('/createSupplier', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), supplierContrller.create);

// router.put('/updateBranch', entityAuth.authorizeEntity("Supplier", "update"), supplierContrller.updateBranchByVendor);

router.post('/updateSupplier', entityAuth.authorizeEntity("Purchases", "Supplier", "update"), supplierContrller.update);

router.post('/add/items', entityAuth.authorizeEntity("Purchases", "Supplier", "update"), supplierContrller.addItems);

router.delete('/remove/items', entityAuth.authorizeEntity('Purchases', 'Supplier', 'update'), supplierContrller.removeItems);


router.get('/Supplier/:clientId/:supplierId', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), supplierContrller.getParticular);

router.get('/listSupplier', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), supplierContrller.list);

router.post("/activeInactiveSupplier", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), supplierContrller.activeinactive);

router.post("/softDeleteSupplier", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), supplierContrller.softDelete);

router.get("/get/active/supplier/:clientId", entityAuth.authorizeEntity("Purchases", "Supplier", "view"), supplierContrller.getAllActive)

router.post('/addNewAddress', entityAuth.authorizeEntity("Purchases", "Supplier", "view"), supplierContrller.addNewAddress);

router.post('/updateAddress', entityAuth.authorizeEntity("Purchases", "Supplier", "view"), supplierContrller.updateAddress);

router.post('/deleteAddress', entityAuth.authorizeEntity("Purchases", "Supplier", "view"), supplierContrller.deleteAddress);

router.get('/getAddresses/:clientId/:customerId', entityAuth.authorizeEntity("Administration", "Customer", "create"), supplierContrller.getAddresses);




// # create, update, view, list, activate/inactive, delete 






exports.router = router;
