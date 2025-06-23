

const express = require("express");
let router = express.Router();
const productlistingController = require("../controller/productListing.controller")






router.get('/get/laptopList/v1/:clientId', productlistingController.getLaptopList1);
router.get('/get/product/v1/:clientId/:productStockId', productlistingController.getProduct);



router.get("/products/:clientId/category/:categoryId", productlistingController.getProductsByCategory);
router.get("/products/:clientId/subcategory/:subcategoryId", productlistingController.getProductsBySubcategory);


exports.router = router;
