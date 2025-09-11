

const express = require("express");
let router = express.Router();



const vendorBranchContrller = require("../controller/branch.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon, uploadIconToS3 } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Branch by vendor routes starts here

// router.post('/createBranch', entityAuth.authorizeEntity("Branch", "create"), vendorBranchContrller.createBranchByVendor);

// router.post('/createBranch', entityAuth.authorizeEntity("Administration", "Branch", "create"), (req, res, next) => {
//     uploadBranchIcon.single("icon")(req, res, (err) => {
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
// }, vendorBranchContrller.createBranchByVendor);


router.post(
    '/createBranch',
    entityAuth.authorizeEntity("Administration", "Branch", "create"),
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
            await vendorBranchContrller.createBranchByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

// router.put('/updateBranch', entityAuth.authorizeEntity("Branch", "update"), vendorBranchContrller.updateBranchByVendor);

// router.put('/updateBranch', entityAuth.authorizeEntity("Administration", "Branch", "update"), (req, res, next) => {
//     uploadBranchIcon.single("icon")(req, res, (err) => {
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
// }, vendorBranchContrller.updateBranchByVendor);


router.put(
    '/updateBranch',
    entityAuth.authorizeEntity("Administration", "Branch", "update"),
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
            await vendorBranchContrller.updateBranchByVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);

router.get('/branch/:clientId/:branchId', entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.getParticularBranchByVendor);

router.get('/listBranch', entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.listBranch);

router.post("/activeInactiveBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.activeinactiveBranchByVendor);

router.post("/softDeleteBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.softDeleteBranchByVendor);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId',  vendorBranchContrller.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
