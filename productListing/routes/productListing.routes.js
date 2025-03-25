

const express = require("express");
let router = express.Router();
const productlistingController = require("../controller/productListing.controller")






router.get('/get/laptopList/v1/:clientId', productlistingController.getLaptopList1);
router.get('/get/product/v1/:clientId/:productStockId', productlistingController.getProduct);



exports.router = router;
