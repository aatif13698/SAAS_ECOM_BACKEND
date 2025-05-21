

const express = require("express");
let router = express.Router();



const customerContrller = require("../controller/customer.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon, uploadProfile } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Branch by vendor routes starts here

// router.post('/createBranch', entityAuth.authorizeEntity("Branch", "create"), customerContrller.createBranchByVendor);

router.post('/createCustomer', entityAuth.authorizeEntity("Administration", "Customer", "create"), (req, res, next) => {
    uploadProfile.single("profileImage")(req, res, (err) => {
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
}, customerContrller.create);

// router.put('/updateBranch', entityAuth.authorizeEntity("Branch", "update"), customerContrller.updateBranchByVendor);

router.put('/updateCustomer', entityAuth.authorizeEntity("Administration", "Customer", "update"), (req, res, next) => {
     uploadProfile.single("profileImage")(req, res, (err) => {
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
}, customerContrller.update);

router.get('/customer/:clientId/:customerId', entityAuth.authorizeEntity("Administration", "Customer", "view"), customerContrller.getParticular);

router.get('/listCustomer', entityAuth.authorizeEntity("Administration", "Customer", "view"), customerContrller.list);

router.post("/activeInactiveCustomer", entityAuth.authorizeEntity("Administration", "Customer", "create"), customerContrller.activeinactive);

router.post("/softDeleteEmployee", entityAuth.authorizeEntity("Administration", "Branch", "create"), customerContrller.softDelete);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), customerContrller.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "Branch", "create"), customerContrller.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
