

const express = require("express");
const multer = require('multer');

let router = express.Router();
const auth = require('../../middleware/authorization/superAdmin');
const statusCode = require("../../utils/http-status-code")

const {
    uploadProfile, 
} = require('../../utils/multer');

const userAuthController = require("../controller/user.controller");
const customerAuth = require("../../middleware/authorization/customer")



// # login, login with otp, forget password, resent password, profile routes starts here

router.post('/signup', userAuthController.signup );

router.post('/verifyOtp', userAuthController.verifyOtp);

router.post('/signIn', userAuthController.signIn );

router.post('/signInByOtp', userAuthController.signInByOtp );

router.post('/resendSignInOtp',userAuthController.resendSignInOtp );

router.post('/forgetpassword', userAuthController.forgetPassword );

router.post('/resetpassword', userAuthController.resetPassword );

router.post('/editProfile',  customerAuth.customer, (req, res, next) => {
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
}, userAuthController.editProfile);



// get  profile
router.get('/getProfile/:clientId/:customerId', customerAuth.customer, userAuthController.getProfile);



router.post('/addNewAddress', userAuthController.addNewAddress );






// # login, login with otp, forget password, resent password, profile routes starts here






exports.router = router;
