

const express = require("express");
let router = express.Router();



const orderContrller = require("../controller/orders.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete


router.get('/listOrder', entityAuth.authorizeEntity("Inventory", "Order", "create"), orderContrller.list);

router.get('/order/:clientId/:orderId', entityAuth.authorizeEntity("Inventory", "Order", "create"), orderContrller.getParticular);

router.post("/order/status/update",entityAuth.authorizeEntity("Inventory", "Order", "update"), orderContrller.updateOrderStatus);

router.post('/createOrder', entityAuth.authorizeEntity("Inventory", "Order", "create"), orderContrller.createOrder);

router.put('/updateOrder', entityAuth.authorizeEntity("Inventory", "Order", "update"), orderContrller.update);


router.post("/activeInactiveOrder", entityAuth.authorizeEntity("Inventory", "Order", "create"), orderContrller.activeinactive);

router.post("/softDeleteOrder", entityAuth.authorizeEntity("Inventory", "Order", "create"), orderContrller.softDelete);





// # create, update, view, list, activate/inactive, delete 






exports.router = router;
