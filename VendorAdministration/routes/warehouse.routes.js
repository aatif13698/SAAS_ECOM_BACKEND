

const express = require("express");
let router = express.Router();



const vendorWarehouseContrller = require("../controller/warehouse.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadWarehouseIcon, uploadIconToS3 } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Warehouse by vendor routes starts here

// router.post('/createWarehouse', entityAuth.authorizeEntity("Warehouse", "create"), vendorWarehouseContrller.createWarehouseByVendor);
// router.post('/createWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), (req, res, next) => {
//     uploadWarehouseIcon.single("icon")(req, res, (err) => {
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
// }, vendorWarehouseContrller.createWarehouseByVendor);



router.post(
    '/createWarehouse',
    entityAuth.authorizeEntity("Administration", "Warehouse", "create"),
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
            await vendorWarehouseContrller.createWarehouseByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

// router.put('/updateWarehouse', entityAuth.authorizeEntity("Warehouse", "update"), vendorWarehouseContrller.updateWarehouseByVendor);

// router.put('/updateWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "update"), (req, res, next) => {
//     uploadWarehouseIcon.single("icon")(req, res, (err) => {
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
// }, vendorWarehouseContrller.updateWarehouseByVendor);


router.put(
    '/updateWarehouse',
    entityAuth.authorizeEntity("Administration", "Warehouse", "update"),
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
            await vendorWarehouseContrller.updateWarehouseByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.get('/Warehouse/:clientId/:warehouseId', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.getParticularWarehouseByVendor);
router.get('/warehouseByBranch/:clientId/:branchId',  vendorWarehouseContrller.getWarehouseByBranch);

router.get('/listWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.listWarehouse);

router.post("/activeInactiveWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.activeinactiveWarehouseByVendor);

router.post("/softDeleteWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.softDeleteWarehouseByVendor);

router.post("/restoreWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.restoreWarehouseByVendor);



// # create, update, view, list, activate/inactive, delete Warehouse by Warehouse routes ends here






exports.router = router;
