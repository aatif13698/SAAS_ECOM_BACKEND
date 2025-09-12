

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const auth = require("../../middleware/authorization/superAdmin");


const categoryContrller = require("../controller/category.controller");


const {
    uploadCategorySubCategoryIcon,
    uploadIconToS3,
} = require('../../utils/multer');
const multer = require("multer");



// # create, update, view, list, activate/inactive, delete Category by super admin routes starts here

// router.post('/createCategory', auth.superAdminAuth, (req, res, next) => {
//     uploadCategorySubCategoryIcon.single("icon")(req, res, (err) => {
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
// }, categoryContrller.createCategoryBySuperAdmin);


router.post(
    '/createCategory',
    auth.superAdminAuth,
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
            await categoryContrller.createCategoryBySuperAdmin(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


// router.post('/updateCategory', auth.superAdminAuth, (req, res, next) => {
//     uploadCategorySubCategoryIcon.single("icon")(req, res, (err) => {
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
// }, categoryContrller.updateCategoryBySuperAdmin);


router.post(
    '/updateCategory',
    auth.superAdminAuth,
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
            await categoryContrller.updateCategoryBySuperAdmin(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



router.get('/category/:categoryId', auth.superAdminAuth, categoryContrller.getParticularCategoryBySuperAdmin);

router.get('/listCategory', auth.superAdminAuth, categoryContrller.listCategory);

router.get('/allActiveCategory', auth.superAdminAuth, categoryContrller.allActiveCategory);

router.post("/activeInactiveCategory", auth.superAdminAuth, categoryContrller.activeinactiveCategoryBySuperAdmin);

router.post("/softDeleteCategory", auth.superAdminAuth, categoryContrller.softDeleteCategoryBySuperAdmin);

router.post("/restoreCategory", auth.superAdminAuth, categoryContrller.restoreCategoryBySuperAdmin);



// # create, update, view, list, activate/inactive, delete Category by super admin routes ends here






exports.router = router;
