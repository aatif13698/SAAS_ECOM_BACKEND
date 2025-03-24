

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const auth = require("../../middleware/authorization/superAdmin");


const categoryContrller = require("../controller/category.controller");


const {
    uploadCategorySubCategoryIcon,
} = require('../../utils/multer');
const multer = require("multer");



// # create, update, view, list, activate/inactive, delete Category by super admin routes starts here

router.post('/createCategory', auth.superAdminAuth, (req, res, next) => {
    uploadCategorySubCategoryIcon.single("icon")(req, res, (err) => {
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
}, categoryContrller.createCategoryBySuperAdmin);


router.post('/updateCategory', auth.superAdminAuth, (req, res, next) => {
    uploadCategorySubCategoryIcon.single("icon")(req, res, (err) => {
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
}, categoryContrller.updateCategoryBySuperAdmin);


router.get('/category/:categoryId', auth.superAdminAuth, categoryContrller.getParticularCategoryBySuperAdmin);

router.get('/listCategory', auth.superAdminAuth, categoryContrller.listCategory);

router.get('/allActiveCategory', auth.superAdminAuth, categoryContrller.allActiveCategory);

router.post("/activeInactiveCategory", auth.superAdminAuth, categoryContrller.activeinactiveCategoryBySuperAdmin);

router.post("/softDeleteCategory", auth.superAdminAuth, categoryContrller.softDeleteCategoryBySuperAdmin);

router.post("/restoreCategory", auth.superAdminAuth, categoryContrller.restoreCategoryBySuperAdmin);



// # create, update, view, list, activate/inactive, delete Category by super admin routes ends here






exports.router = router;
