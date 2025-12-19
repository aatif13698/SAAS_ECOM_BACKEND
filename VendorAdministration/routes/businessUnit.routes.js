

const express = require("express");
let router = express.Router();



const vendorBusinessUnitContrller = require("../controller/businessUnit.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBusinesUnitIcon, uploadIconToS3, uploadDocuments } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Business unit by vendor routes starts here

// router.post('/createBusinessUnit', entityAuth.authorizeEntity("Business Unit", "create"), vendorBusinessUnitContrller.createBusinessUnitByVendor);

// router.post('/createBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), (req, res, next) => {
//     uploadBusinesUnitIcon.single("icon")(req, res, (err) => {
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
// }, vendorBusinessUnitContrller.createBusinessUnitByVendor);

router.post(
    '/createBusinessUnit',
    entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"),
    uploadDocuments.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'tinDocument', maxCount: 1 },
        { name: 'cinDocument', maxCount: 1 },
        { name: 'tanDocument', maxCount: 1 },
        { name: 'businessLicenseDocument', maxCount: 1 },
        { name: 'panDocument', maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            // Validate file uploads
            const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const files = req.files;
            for (const field in files) {
                const file = files[field][0];
                if (!allowedMimetypes.includes(file.mimetype)) {
                    return res.status(400).send({
                        message: `Invalid file type for ${field}. Only JPEG, PNG, WEBP and GIF are allowed.`
                    });
                }
            }
            // Process the request
            await vendorBusinessUnitContrller.createBusinessUnitByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

// router.put('/updateBusinessUnit', entityAuth.authorizeEntity("Business Unit", "update"), vendorBusinessUnitContrller.updateBusinessUnitByVendor);
// router.put('/updateBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "update"), (req, res, next) => {
//     uploadBusinesUnitIcon.single("icon")(req, res, (err) => {
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
// }, vendorBusinessUnitContrller.updateBusinessUnitByVendor);

router.put(
    '/updateBusinessUnit',
    entityAuth.authorizeEntity("Administration", "BusinessUnit", "update"),
    uploadDocuments.fields([
        { name: 'icon', maxCount: 1 },
        { name: 'tinDocument', maxCount: 1 },
        { name: 'cinDocument', maxCount: 1 },
        { name: 'tanDocument', maxCount: 1 },
        { name: 'businessLicenseDocument', maxCount: 1 },
        { name: 'panDocument', maxCount: 1 }
    ]),
    async (req, res, next) => {
        try {
            // Validate file uploads
            const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            const files = req.files;
            for (const field in files) {
                const file = files[field][0];
                if (!allowedMimetypes.includes(file.mimetype)) {
                    return res.status(400).send({
                        message: `Invalid file type for ${field}. Only JPEG, PNG, WEBP and GIF are allowed.`
                    });
                }
            }
            // Process the request
            await vendorBusinessUnitContrller.updateBusinessUnitByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

router.post("/refresh/master/group", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.refreshMasterGroupForBusinessUnit);

router.get('/businessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.getParticularBusinessUnitByVendor);

router.get('/listBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.listBusinessUnit);

router.post("/activeInactiveBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.activeinactiveBusinessUnitByVendor);

router.post("/softDeleteBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.softDeleteBusinesssUnitByVendor);

router.post("/restoreBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.restoreBusinessUnitByVendor);

router.get('/getActiveBusinessUnit',
    //  entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"),
    vendorBusinessUnitContrller.getActiveBusinessUnit);



// # create, update, view, list, activate/inactive, delete BusinessUnit by business unit routes ends here






exports.router = router;
