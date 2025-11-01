

const express = require("express");
let router = express.Router();



const supplierContrller = require("../controller/supplier.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete

// router.post('/createBranch', entityAuth.authorizeEntity("Supplier", "create"), supplierContrller.createBranchByVendor);

router.post('/createSupplier', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierContrller.create);

// router.put('/updateBranch', entityAuth.authorizeEntity("Supplier", "update"), supplierContrller.updateBranchByVendor);

router.post('/updateSupplier', entityAuth.authorizeEntity("Inventory", "Supplier", "update"), supplierContrller.update);

router.post('/add/items', entityAuth.authorizeEntity("Inventory", "Supplier", "update"), supplierContrller.addItems);

router.delete('/remove/items', entityAuth.authorizeEntity('Inventory', 'Supplier', 'update'), supplierContrller.removeItems);


router.get('/Supplier/:clientId/:supplierId', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierContrller.getParticular);

router.get('/listSupplier', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierContrller.list);

router.post("/activeInactiveSupplier", entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierContrller.activeinactive);

router.post("/softDeleteSupplier", entityAuth.authorizeEntity("Inventory", "Supplier", "create"), supplierContrller.softDelete);

router.get("/get/active/supplier/:clientId", entityAuth.authorizeEntity("Inventory", "Supplier", "view"), supplierContrller.getAllActive)

router.post('/addNewAddress', entityAuth.authorizeEntity("Inventory", "Supplier", "view"), supplierContrller.addNewAddress);

router.post('/updateAddress', entityAuth.authorizeEntity("Inventory", "Supplier", "view"), supplierContrller.updateAddress);

router.post('/deleteAddress', entityAuth.authorizeEntity("Inventory", "Supplier", "view"), supplierContrller.deleteAddress);

router.get('/getAddresses/:clientId/:customerId', entityAuth.authorizeEntity("Administration", "Customer", "create"), supplierContrller.getAddresses);




// # create, update, view, list, activate/inactive, delete 






exports.router = router;
