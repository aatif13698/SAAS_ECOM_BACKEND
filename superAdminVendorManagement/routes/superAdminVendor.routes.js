

const express = require("express");
let router = express.Router();
const auth = require("../../middleware/authorization/superAdmin");

const {uploadImages} = require("../../utils/multer")



const supersuperAdminController = require("../controller/superAdminVendor.controller");


// # create, update, view, list, activate/inactive, delete Business Unit routes starts here


// router.post('/createVendor', auth.superAdminAuth, supersuperAdminController.createVendor);

router.post('/createVendor',  auth.superAdminAuth, (req, res, next) => {
    uploadImages.array("images")(req, res, (err) => {
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
}, supersuperAdminController.createVendor);

router.put('/updateVendor/:userId', auth.superAdminAuth, supersuperAdminController.updateVendor);

router.get('/vendor/:userId', auth.superAdminAuth, supersuperAdminController.getVendor);

router.get('/listVendor', auth.superAdminAuth, supersuperAdminController.listVendor);

router.post("/activeInactiveVendor", auth.superAdminAuth, supersuperAdminController.activeinactiveVendor);

router.post("/softDeleteVendor", auth.superAdminAuth, supersuperAdminController.softDeleteVendor);

router.post("/restoreVendor", auth.superAdminAuth, supersuperAdminController.restoreVendor);


// # create, update, view, list, activate/inactive, delete Business Unit routes ends here






exports.router = router;
