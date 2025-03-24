

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const auth = require("../../middleware/authorization/superAdmin");


const subCategoryContrller = require("../controller/subCategory.controller");


const {
    uploadCategorySubCategoryIcon,
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete subCategory by super admin routes starts here

router.post('/createSubCategory', auth.superAdminAuth, (req, res, next) => {
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
}, subCategoryContrller.createSubCategoryBySuperAdmin);


router.post('/updateSubCategory', auth.superAdminAuth, (req, res, next) => {
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
}, subCategoryContrller.updateSubCategoryBySuperAdmin);


router.get('/subCategory/:subCategoryId', auth.superAdminAuth, subCategoryContrller.getParticularSubCategoryBySuperAdmin);

router.get('/listSubCategory', auth.superAdminAuth, subCategoryContrller.listSubCategory);

router.post("/activeInactiveSubCategory", auth.superAdminAuth, subCategoryContrller.activeinactiveSubCategoryBySuperAdmin);

router.post("/softDeleteSubCategory", auth.superAdminAuth, subCategoryContrller.softDeleteSubCategoryBySuperAdmin);

router.post("/restoreSubCategory", auth.superAdminAuth, subCategoryContrller.restoreSubCategoryBySuperAdmin);



// # create, update, view, list, activate/inactive, delete Category by super admin routes ends here






exports.router = router;
