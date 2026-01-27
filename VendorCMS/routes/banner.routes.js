

const express = require("express");
let router = express.Router();



const bannerController = require("../controller/banner.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadImagesToS3, uploadIconToS3 } = require("../../utils/multer");


// # create, update, view, list, activate/inactive 

router.post(
    '/create/banner',
    entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"),
    uploadIconToS3.single("image"),
    async (req, res, next) => {
        try {
            // Validate file upload
            if (req.file) {
                const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimetypes.includes(req.file.mimetype)) {
                    return res.status(400).send({
                        message: 'Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.'
                    });
                }
            }
            // Process the request
            await bannerController.create(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.get('/list/banner', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), bannerController.list);


router.post(
    '/update/banner',
    entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"),
    uploadIconToS3.single("image"),
    async (req, res, next) => {
        try {
            // Validate file upload
            if (req.file) {
                const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimetypes.includes(req.file.mimetype)) {
                    return res.status(400).send({
                        message: 'Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.'
                    });
                }
            }
            // Process the request
            await bannerController.update(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);
router.post('/arraneg/order', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), bannerController.updateBannerOrders); // or POST if you prefer

router.get('/get/banner/by/id/:clientId/:id', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), bannerController.bannerById);

router.get('/get/all/banners/:clientId', bannerController.banners);


// # create, update, view, list, activate/inactive


exports.router = router;
