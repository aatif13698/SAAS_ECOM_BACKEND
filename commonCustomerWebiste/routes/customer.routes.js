

const express = require("express");
const multer = require('multer');

let router = express.Router();

const customerCoontroller = require("../controller/customer.controller");

const customerAuth = require("../../middleware/authorization/customer");
const {
    uploadCustomizable,
    uploadProductBlueprintToS3,
    uploadCustomizationFileToS3

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

router.post('/cart/add/new', customerAuth.customer, uploadCustomizationFileToS3.any(), customerCoontroller.addToCartNew);
router.post('/cart/change/quantity', customerAuth.customer, customerCoontroller.addToCartNew);
router.delete("/cart/remove", customerAuth.customer, customerCoontroller.removeFromCart);
router.get("/cart", customerAuth.customer, customerCoontroller.getCart);

// routes for wishlist
router.post('/wishlist/add/new', customerAuth.customer, uploadCustomizable.any(), customerCoontroller.addToWishList);
router.get("/wishlist", customerAuth.customer, customerCoontroller.getWishList);
router.delete("/wishlist/remove", customerAuth.customer, customerCoontroller.removeFromWishList);



// routes for rating and reviews
router.post(
    '/create/ratingAndReview',
    customerAuth.customer,
    uploadProductBlueprintToS3.array("file", 5),
    async (req, res, next) => {
        try {
            // Validate file uploads
            if (req.files && req.files.length > 0) {
                const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                for (const file of req.files) {
                    if (!allowedMimetypes.includes(file.mimetype)) {
                        return res.status(400).send({
                            message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
                        });
                    }
                }
            }
            // Process the request
            await customerCoontroller.postRating(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


// routes for rating and reviews
router.post(
    '/update/ratingAndReview',
    customerAuth.customer,
    uploadProductBlueprintToS3.array("file", 5),
    async (req, res, next) => {
        try {
            // Validate file uploads
            if (req.files && req.files.length > 0) {
                const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                for (const file of req.files) {
                    if (!allowedMimetypes.includes(file.mimetype)) {
                        return res.status(400).send({
                            message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
                        });
                    }
                }
            }
            // Process the request
            await customerCoontroller.updateRating(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

router.get('/get/review/product/:clientId/:productMainStockId', customerAuth.customer, customerCoontroller.getReviewsByProduct);
router.get('/get/review/one/product/:reviewId', customerAuth.customer, customerCoontroller.getReviewsByReviewId);
router.delete('/delete/review/:clientId/:id', customerAuth.customer, customerCoontroller.deleteReview);

router.get('/get/all/review/customer', customerAuth.customer, customerCoontroller.getAllReviewsByCustomer);





exports.router = router;
