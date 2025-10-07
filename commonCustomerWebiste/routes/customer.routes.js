

const express = require("express");
const multer = require('multer');

let router = express.Router();

const customerCoontroller = require("../controller/customer.controller");

const customerAuth = require("../../middleware/authorization/customer");
const {
    uploadCustomizable
    
} = require('../../utils/multer');
const httpStatusCode = require("../../utils/http-status-code");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");




router.get('/getCategoryAndSubcategory/:clientId', customerCoontroller.getCategoryAndSubCategory);

// routes for address
router.post('/addNewAddress', customerAuth.customer, customerCoontroller.addNewAddress);
router.post('/updateAddress', customerAuth.customer, customerCoontroller.updateAddress);
router.post('/deleteAddress', customerAuth.customer, customerCoontroller.deleteAddress);
router.get('/getAddresses/:clientId/:customerId', customerAuth.customer, customerCoontroller.getAddresses);
router.get('/vendor/getAddresses/:clientId/:customerId', entityAuth.authorizeEntity("Administration", "Customer", "create"), customerCoontroller.getAddresses);
router.post('/vendor/addNewAddress', entityAuth.authorizeEntity("Administration", "Customer", "create"), customerCoontroller.addNewAddressByVendor);
router.post('/vendor/updateAddress', entityAuth.authorizeEntity("Administration", "Customer", "create"), customerCoontroller.updateAddressByVendor);
router.post('/vendor/deleteAddress', entityAuth.authorizeEntity("Administration", "Customer", "create"), customerCoontroller.deleteAddressByVendor);


// routes for cart
router.post("/cart/add", customerAuth.customer, customerCoontroller.addToCart);

router.post('/cart/add/new', customerAuth.customer, uploadCustomizable.any(), customerCoontroller.addToCartNew);
router.delete("/cart/remove", customerAuth.customer, customerCoontroller.removeFromCart);
router.get("/cart", customerAuth.customer, customerCoontroller.getCart);

router.post('/wishlist/add/new', customerAuth.customer, uploadCustomizable.any(), customerCoontroller.addToWishList);
router.get("/wishlist", customerAuth.customer, customerCoontroller.getWishList);
router.delete("/wishlist/remove", customerAuth.customer, customerCoontroller.removeFromWishList);



 




exports.router = router;
