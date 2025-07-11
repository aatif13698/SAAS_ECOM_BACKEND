

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const productBluePrintContrller = require("../controller/productBluePrint.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadBrandIcon,
    uploadProductBlueprint
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete 

router.post('/createProductBlueprint', entityAuth.authorizeEntity("Product", "Product", "create"), (req, res, next) => {
    uploadProductBlueprint.array("file")(req, res, (err) => {
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
}, productBluePrintContrller.create);


router.post('/updateProductBlueprint', entityAuth.authorizeEntity("Product", "Product", "update"), (req, res, next) => {
    uploadProductBlueprint.array("file")(req, res, (err) => {
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
}, productBluePrintContrller.update);


router.get('/productBlueprint/:clientId/:productBlueprintId', entityAuth.authorizeEntity("Product", "Product", "view"), productBluePrintContrller.getParticulae);

router.get('/listProductBlueprint', entityAuth.authorizeEntity("Product", "Product", "view"), productBluePrintContrller.list);
router.get('/getActiveProductBlueprint/:clientId', entityAuth.authorizeEntity("Product", "Product", "view"), productBluePrintContrller.getActive);

router.post("/activeInactiveProductBlueprint", entityAuth.authorizeEntity("Product", "Product", "update"), productBluePrintContrller.activeinactive);

router.post("/softDeleteProductBlueprint", entityAuth.authorizeEntity("Product", "Product", "create"), productBluePrintContrller.softDelete);





// # create, update, view, list, activate/inactive, delete






exports.router = router;
