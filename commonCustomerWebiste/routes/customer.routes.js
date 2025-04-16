

const express = require("express");
const multer = require('multer');

let router = express.Router();

const customerCoontroller = require("../controller/customer.controller");

const customerAuth = require("../../middleware/authorization/customer");
const {
    uploadCustomizable
    
} = require('../../utils/multer');
const httpStatusCode = require("../../utils/http-status-code");



router.get('/getCategoryAndSubcategory/:clientId', customerCoontroller.getCategoryAndSubCategory);

// routes for address
router.post('/addNewAddress', customerAuth.customer, customerCoontroller.addNewAddress);
router.post('/updateAddress', customerAuth.customer, customerCoontroller.updateAddress);
router.post('/deleteAddress', customerAuth.customer, customerCoontroller.deleteAddress);
router.get('/getAddresses/:clientId/:customerId', customerAuth.customer, customerCoontroller.getAddresses);


// routes for cart
router.post("/cart/add", customerAuth.customer, customerCoontroller.addToCart);

router.post('/cart/add/new', customerAuth.customer, uploadCustomizable.any(), customerCoontroller.addToCartNew);
router.delete("/cart/remove", customerAuth.customer, customerCoontroller.removeFromCart);
router.get("/cart", customerAuth.customer, customerCoontroller.getCart);

 




exports.router = router;
