

const express = require("express");
const multer = require('multer');

let router = express.Router();
const auth = require('../../middleware/authorization/superAdmin');
const statusCode = require("../../utils/http-status-code")


const {
    uploadProfile,
    uploadProfileToS3, 
} = require('../../utils/multer');

const supersuperAdminController = require("../controller/superAdmin.controller");


// # login, login with otp, forget password, resent password, profile routes starts here

router.post('/signIn', supersuperAdminController.signIn );

router.post('/signInByOtp', supersuperAdminController.signInByOtp );

router.post('/resendSignInOtp',supersuperAdminController.resendSignInOtp );

router.post('/forgetpassword', supersuperAdminController.forgetPassword );

router.post('/resetpassword', supersuperAdminController.resetPassword );

// create and update profile for admin
router.post('/superAdminProfile', (req, res, next) => {
    uploadProfileToS3.single("profileImage")(req, res, (err) => {
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
}, supersuperAdminController.updateProfile);

// get Admin profile
router.get('/getSuperAdminProfile/:id', auth.superAdminAuth, supersuperAdminController.getProfile);




// # login, login with otp, forget password, resent password, profile routes starts here






exports.router = router;
