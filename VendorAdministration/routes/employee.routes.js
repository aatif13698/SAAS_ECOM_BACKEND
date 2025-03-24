

const express = require("express");
let router = express.Router();



const employeeContrller = require("../controller/employee.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Branch by vendor routes starts here

// router.post('/createBranch', entityAuth.authorizeEntity("Branch", "create"), employeeContrller.createBranchByVendor);

router.post('/createEmployee', entityAuth.authorizeEntity("Administration", "Branch", "create"), (req, res, next) => {
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
}, employeeContrller.create);

// router.put('/updateBranch', entityAuth.authorizeEntity("Branch", "update"), employeeContrller.updateBranchByVendor);

router.put('/updateEmployee', entityAuth.authorizeEntity("Administration", "Branch", "update"), (req, res, next) => {
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
}, employeeContrller.update);

router.get('/employee/:clientId/:employeeId', entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.getParticular);

router.get('/listEmployee', entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.list);

router.post("/activeInactiveEmployee", entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.activeinactive);

router.post("/softDeleteEmployee", entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.softDelete);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
