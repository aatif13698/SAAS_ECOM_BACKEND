

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const auth = require("../../middleware/authorization/superAdmin");


const subCategoryContrller = require("../controller/subCategory.Controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadCategorySubCategoryIcon,
    uploadIconToS3
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete subCategory by super admin routes starts here

router.get('/activeCategory/:clientId', entityAuth.authorizeEntity("Product", "SubCategory", "view"), subCategoryContrller.getAllActiveCategory);

// old
// router.post('/createSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "create"), (req, res, next) => {
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
// }, subCategoryContrller.createSubCategory);

// new
router.post(
    '/createSubCategory',
    entityAuth.authorizeEntity("Product", "SubCategory", "create"),
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
            await subCategoryContrller.createSubCategory(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



// router.post('/updateSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "update"), (req, res, next) => {
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
// }, subCategoryContrller.updateSubCategory);


router.post(
    '/updateSubCategory',
    entityAuth.authorizeEntity("Product", "SubCategory", "create"),
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
            await subCategoryContrller.updateSubCategory(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



router.get('/subCategory/:subCategoryId', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.getParticularSubCategory);
router.get('/subCategoryByCategory/:clientId/:categoryId', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.getSubcategoryByCategory);

router.get('/listSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.listSubCategory);

router.post("/activeInactiveSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.activeinactiveSubCategory);

router.post("/softDeleteSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.softDeleteSubCategory);

router.post("/restoreSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.restoreSubCategory);



// # create, update, view, list, activate/inactive, delete Category by super admin routes ends here






exports.router = router;
