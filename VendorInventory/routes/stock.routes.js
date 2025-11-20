

const express = require("express");
let router = express.Router();



const stockContrller = require("../controller/stock.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon, uploadProductBlueprintToS3 } = require("../../utils/multer");


const {
    uploadProductBlueprint
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete


// router.post('/createStock', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), stockContrller.create);


// router.post('/createStock', entityAuth.authorizeEntity("Inventory", "Supplier", "create"), (req, res, next) => {
//     uploadProductBlueprint.array("file")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
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
// }, stockContrller.create);

router.post(
    '/createStock',
    entityAuth.authorizeEntity("Purchases", "Supplier", "create"),
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
            await stockContrller.create(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



// router.post('/updateStock', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), (req, res, next) => {
//     uploadProductBlueprint.array("file")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
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
// }, stockContrller.update);


router.post(
    '/updateStock',
    entityAuth.authorizeEntity("Purchases", "Supplier", "create"),
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
            await stockContrller.update(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

// router.post('/updateStock', entityAuth.authorizeEntity("Purchases", "Supplier", "update"), stockContrller.update);

router.get('/stock/:clientId/:stockId', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.getParticular);

router.get('/stockbyproduct/:clientId/:product', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.getStockByProduct);

router.get('/listStock', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.list);

router.post("/activeInactiveStock", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.activeinactive);

router.post("/softDeleteStock", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.softDelete);

router.get('/getAllStock', entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.getAllStock);

router.get("/listStock/all", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.listStock);

router.get("/listStock/all/of/supplier", entityAuth.authorizeEntity("Purchases", "Supplier", "create"), stockContrller.listStockOfSupplier);





// # create, update, view, list, activate/inactive, delete 






exports.router = router;
