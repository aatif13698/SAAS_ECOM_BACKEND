

const express = require("express");
const multer = require('multer');

let router = express.Router();

const customerOrder = require("../controller/order.controller");

const customerAuth = require("../../middleware/authorization/customer");
const { uploadCustomizable, uploadCustomizationFileToS3 } = require("../../utils/multer");


// place order from product detail pages
// router.post('/place-order', customerAuth.customer, customerOrder.placeOrderTypeOne);

router.post('/place-order', customerAuth.customer,  uploadCustomizationFileToS3.any(), customerOrder.placeOrderTypeOneNew);

router.post("/place-order-from-cart", customerAuth.customer, customerOrder.placeOrderFromCart);

// place order from the cart
router.post('/place-order/from-cart', customerAuth.customer, customerOrder.placeOrderTypeTwo);

// get orders list
router.get("/order", customerAuth.customer, customerOrder.getAllOrders);

// get order by Id
router.get("/unique/order/:id", customerAuth.customer, customerOrder.getParticularOrder);





exports.router = router;
