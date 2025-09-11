

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const manufacturerContrller = require("../controller/manufacturer.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadManufacturerIcon,
    uploadIconToS3,
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete manufacturer by vendor routes starts here

// router.post('/createManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "create"), (req, res, next) => {
//     uploadManufacturerIcon.single("icon")(req, res, (err) => {
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
// }, manufacturerContrller.create);



router.post(
    '/createManufacturer',
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
            await manufacturerContrller.create(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



// router.post('/updateManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "update"), (req, res, next) => {
//     uploadManufacturerIcon.single("icon")(req, res, (err) => {
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
// }, manufacturerContrller.update);



router.post(
    '/updateManufacturer',
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
            await manufacturerContrller.update(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.get('/manufacturer/:manufacturerId', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.getParticulae);

router.get('/listManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.list);
router.get('/getActiveManufacturer/:clientId', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.getActive);

router.post("/activeInactiveManufacturer", entityAuth.authorizeEntity("Product", "Manufacturer", "update"), manufacturerContrller.activeinactive);

router.post("/softDeleteManufacturer", entityAuth.authorizeEntity("Product", "Manufacturer", "softDelete"), manufacturerContrller.softDelete);




// # create, update, view, list, activate/inactive, delete manufacturer by vendor routes ends here






exports.router = router;
