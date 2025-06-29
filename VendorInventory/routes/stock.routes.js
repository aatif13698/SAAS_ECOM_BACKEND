

const express = require("express");
let router = express.Router();



const stockContrller = require("../controller/stock.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete


router.post('/createStock', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.create);

router.post('/updateStock', entityAuth.authorizeEntity("Inventory", "Supplier", "update"), stockContrller.update);

router.get('/stock/:clientId/:stockId', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.getParticular);

router.get('/listStock', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.list);

router.post("/activeInactiveStock", entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.activeinactive);

router.post("/softDeleteStock", entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.softDelete);

router.get('/getAllStock', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.getAllStock);





// # create, update, view, list, activate/inactive, delete 






exports.router = router;
