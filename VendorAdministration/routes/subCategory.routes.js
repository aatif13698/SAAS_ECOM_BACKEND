

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const auth = require("../../middleware/authorization/superAdmin");


const subCategoryContrller = require("../controller/subCategory.Controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadCategorySubCategoryIcon,
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete subCategory by super admin routes starts here

router.get('/activeCategory/:clientId', entityAuth.authorizeEntity("Product", "SubCategory", "view"), subCategoryContrller.getAllActiveCategory);


router.post('/createSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "create"), (req, res, next) => {
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
}, subCategoryContrller.createSubCategory);


router.post('/updateSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "update"), (req, res, next) => {
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
}, subCategoryContrller.updateSubCategory);


router.get('/subCategory/:subCategoryId', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.getParticularSubCategory);
router.get('/subCategoryByCategory/:clientId/:categoryId', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.getSubcategoryByCategory);

router.get('/listSubCategory', entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.listSubCategory);

router.post("/activeInactiveSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.activeinactiveSubCategory);

router.post("/softDeleteSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.softDeleteSubCategory);

router.post("/restoreSubCategory", entityAuth.authorizeEntity("Product", "SubCategory", "create"), subCategoryContrller.restoreSubCategory);



// # create, update, view, list, activate/inactive, delete Category by super admin routes ends here






exports.router = router;
