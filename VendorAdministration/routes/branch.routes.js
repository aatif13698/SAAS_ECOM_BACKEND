

const express = require("express");
let router = express.Router();



const vendorBranchContrller = require("../controller/branch.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Branch by vendor routes starts here

// router.post('/createBranch', entityAuth.authorizeEntity("Branch", "create"), vendorBranchContrller.createBranchByVendor);

router.post('/createBranch', entityAuth.authorizeEntity("Administration", "Branch", "create"), (req, res, next) => {
    uploadBranchIcon.single("icon")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // MulterError: File too large
                return res.status(statusCode.BadRequest).send({
                    message: 'File too large. Maximum file size allowed is 1 MB.'
                });
            } else {
                // Other errors
                console.error('Multer Error:', err.message);
                return res.status(statusCode.BadRequest).send({
                    message: err.message
                });
            }
        }
        next();
    });
}, vendorBranchContrller.createBranchByVendor);

// router.put('/updateBranch', entityAuth.authorizeEntity("Branch", "update"), vendorBranchContrller.updateBranchByVendor);

router.put('/updateBranch', entityAuth.authorizeEntity("Administration", "Branch", "update"), (req, res, next) => {
    uploadBranchIcon.single("icon")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // MulterError: File too large
                return res.status(statusCode.BadRequest).send({
                    message: 'File too large. Maximum file size allowed is 1 MB.'
                });
            } else {
                // Other errors
                console.error('Multer Error:', err.message);
                return res.status(statusCode.BadRequest).send({
                    message: err.message
                });
            }
        }
        next();
    });
}, vendorBranchContrller.updateBranchByVendor);

router.get('/branch/:clientId/:branchId', entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.getParticularBranchByVendor);

router.get('/listBranch', entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.listBranch);

router.post("/activeInactiveBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.activeinactiveBranchByVendor);

router.post("/softDeleteBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.softDeleteBranchByVendor);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), vendorBranchContrller.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId',  vendorBranchContrller.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
