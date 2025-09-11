

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const brandContrller = require("../controller/brand.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadBrandIcon,
    uploadIconToS3
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete brand by vendor routes starts here

// router.post('/createBrand', entityAuth.authorizeEntity("Product", "Brand", "create"), (req, res, next) => {
//     uploadBrandIcon.single("icon")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 // MulterError: File too large
//                 return res.status(statusCode.BadRequest).send({
//                     message: 'File too large. Maximum file size allowed is 1 MB.'
//                 });
//             } else {
//                 // Other errors
//                 console.error('Multer Error:', err.message);
//                 return res.status(statusCode.BadRequest).send({
//                     message: err.message
//                 });
//             }
//         }
//         next();
//     });
// }, brandContrller.create);

router.post(
    '/createBrand',
    entityAuth.authorizeEntity("Product", "Brand", "create"),
    uploadIconToS3.single("icon"),
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
            await brandContrller.create(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


// router.post('/updateBrand', entityAuth.authorizeEntity("Product", "Brand", "update"), (req, res, next) => {
//     uploadBrandIcon.single("icon")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 // MulterError: File too large
//                 return res.status(statusCode.BadRequest).send({
//                     message: 'File too large. Maximum file size allowed is 1 MB.'
//                 });
//             } else {
//                 // Other errors
//                 console.error('Multer Error:', err.message);
//                 return res.status(statusCode.BadRequest).send({
//                     message: err.message
//                 });
//             }
//         }
//         next();
//     });
// }, brandContrller.update);


router.post(
    '/updateBrand',
    entityAuth.authorizeEntity("Product", "Brand", "create"),
    uploadIconToS3.single("icon"),
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
            await brandContrller.update(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



router.get('/brand/:brandId', entityAuth.authorizeEntity("Product", "Brand", "view"), brandContrller.getParticulae);

router.get('/listBrand', entityAuth.authorizeEntity("Product", "Brand", "view"), brandContrller.list);
router.get('/getActiveBrand/:clientId', entityAuth.authorizeEntity("Product", "Brand", "view"), brandContrller.getActive);

router.post("/activeInactiveBrand", entityAuth.authorizeEntity("Product", "Brand", "update"), brandContrller.activeinactive);

router.post("/softDeleteBrand", entityAuth.authorizeEntity("Product", "Brand", "softDelete"), brandContrller.softDelete);




// # create, update, view, list, activate/inactive, delete brand by vendor routes ends here






exports.router = router;
