

const express = require("express");
const multer = require('multer');

let router = express.Router();
const auth = require('../../middleware/authorization/superAdmin');
const statusCode = require("../../utils/http-status-code")


const {
    uploadProfile,
    uploadDocuments,
    uploadOrg,
} = require('../../utils/multer');

const clientAuthController = require("../controller/clinetAuth.controller");


// # login, login with otp, forget password, resent password, profile routes starts here

router.post('/signIn', clientAuthController.signIn);

router.post('/signInByOtp', clientAuthController.signInByOtp);

router.post('/resendSignInOtp', clientAuthController.resendSignInOtp);

router.post('/forgetpassword', clientAuthController.forgetPassword);

router.post('/resetpassword', clientAuthController.resetPassword);


// router
router.post(
    '/organization', auth.tokenAuth,
    uploadOrg.fields([
        { name: 'longLogo', maxCount: 1 },
        { name: 'shortLogo', maxCount: 1 },
    ]),
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
            await clientAuthController.createOrganization(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }               // Better, RESTful route

);

router.put(
    '/organization/:id',
    auth.tokenAuth,
    uploadOrg.fields([
        { name: 'longLogo', maxCount: 1 },
        { name: 'shortLogo', maxCount: 1 },
    ]),
    clientAuthController.updateOrganization
);

// Optional: GET endpoint for frontend
router.get('/organization/:clientId', auth.tokenAuth, clientAuthController.getOrganization);

// router.post(
//     '/create/orgInfo',
//     uploadOrg.fields([
//         { name: 'longLogo', maxCount: 1 },
//         { name: 'shortLogo', maxCount: 1 },
//     ]),
//     async (req, res, next) => {
//         try {
//             // Validate file uploads
//             const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//             const files = req.files;
//             for (const field in files) {
//                 const file = files[field][0];
//                 if (!allowedMimetypes.includes(file.mimetype)) {
//                     return res.status(400).send({
//                         message: `Invalid file type for ${field}. Only JPEG, PNG, WEBP and GIF are allowed.`
//                     });
//                 }
//             }
//             // Process the request
//             await clientAuthController.createOrgInfo(req, res, next);
//         } catch (error) {
//             console.error('Upload Error:', error.message);
//             return res.status(400).send({
//                 message: error.message
//             });
//         }
//     }
// );

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
