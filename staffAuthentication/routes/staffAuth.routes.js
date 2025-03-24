

const express = require("express");
const multer = require('multer');

let router = express.Router();
const auth = require('../../middleware/authorization/superAdmin');
const statusCode = require("../../utils/http-status-code")


const {
    uploadProfile, 
} = require('../../utils/multer');

const staffAuthController = require("../controller/staffAuth.controller");


// # login, login with otp, forget password, resent password, profile routes starts here

router.post('/signIn', staffAuthController.signIn );

router.post('/signInByOtp', staffAuthController.signInByOtp );

router.post('/resendSignInOtp',staffAuthController.resendSignInOtp );

router.post('/forgetpassword', staffAuthController.forgetPassword );

router.post('/resetpassword', staffAuthController.resetPassword );

// create and update profile for admin
// router.post('/clientProfile', auth.superAdminAuth, (req, res, next) => {
//     uploadProfile.single("profileImage")(req, res, (err) => {
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
// }, supersuperAdminController.updateProfile);

// // get Admin profile
// router.get('/getSuperAdminProfile/:id', auth.superAdminAuth, supersuperAdminController.getProfile);




// # login, login with otp, forget password, resent password, profile routes starts here






exports.router = router;
