

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const productRateContrller = require("../controller/productRate.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadBrandIcon,
    uploadProductBlueprint
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete 

router.post('/createProductRate', entityAuth.authorizeEntity("Product", "Pricing", "create"), productRateContrller.create);

router.post('/updateProductRate', entityAuth.authorizeEntity("Product", "Pricing", "update"), productRateContrller.update);

router.get('/productRate/:clientId/:productRateId', entityAuth.authorizeEntity("Product", "Pricing", "view"), productRateContrller.getParticular);

router.get('/productRateByProduct/:clientId/:productId', entityAuth.authorizeEntity("Product", "Pricing", "view"), productRateContrller.getRateByProduct);

router.get('/listProductRate', entityAuth.authorizeEntity("Product", "Pricing", "view"), productRateContrller.list);

router.post("/softDeleteProductRate", entityAuth.authorizeEntity("Product", "Pricing", "create"), productRateContrller.softDelete);


// # create, update, view, list, activate/inactive, delete






exports.router = router;
