

const express = require("express");
let router = express.Router();
const auth = require("../../middleware/authorization/superAdmin");

const {uploadImages, uploadImagesToS3} = require("../../utils/multer")



const supersuperAdminController = require("../controller/superAdminVendor.controller");


// # create, update, view, list, activate/inactive, delete Business Unit routes starts here


// router.post('/createVendor', auth.superAdminAuth, supersuperAdminController.createVendor);

// router.post('/createVendor',  auth.superAdminAuth, (req, res, next) => {
//     uploadImages.array("images")(req, res, (err) => {
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
// }, supersuperAdminController.createVendor);


router.post(
    '/createVendor',
    auth.superAdminAuth,
    uploadImagesToS3.array("images"),
    async (req, res, next) => {
        try {
            // Validate file uploads
            if (req.files && req.files.length > 0) {
                const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                for (const file of req.files) {
                    if (!allowedMimetypes.includes(file.mimetype)) {
                        return res.status(400).send({
                            message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
                        });
                    }
                }
            }

            // Process the request
            await supersuperAdminController.createVendor(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.put('/updateVendor/:userId', auth.superAdminAuth, supersuperAdminController.updateVendor);

router.get('/vendor/:userId', auth.superAdminAuth, supersuperAdminController.getVendor);

router.get('/listVendor', auth.superAdminAuth, supersuperAdminController.listVendor);

router.post("/activeInactiveVendor", auth.superAdminAuth, supersuperAdminController.activeinactiveVendor);

router.post("/softDeleteVendor", auth.superAdminAuth, supersuperAdminController.softDeleteVendor);

router.post("/restoreVendor", auth.superAdminAuth, supersuperAdminController.restoreVendor);


// # create, update, view, list, activate/inactive, delete Business Unit routes ends here






exports.router = router;
