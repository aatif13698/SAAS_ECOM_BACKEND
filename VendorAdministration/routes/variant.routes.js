

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const productVariantContrller = require("../controller/variant.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadBrandIcon,
    uploadProductBlueprint
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete 

router.post('/createVariant', entityAuth.authorizeEntity("Product", "Variant", "create"), productVariantContrller.create);

router.post('/updateVariant', entityAuth.authorizeEntity("Product", "Variant", "update"), productVariantContrller.update);

router.get('/variant/:clientId/:productRateId', entityAuth.authorizeEntity("Product", "Variant", "view"), productVariantContrller.getParticular);

router.get('/productVariantByProduct/:clientId/:productId', entityAuth.authorizeEntity("Product", "Variant", "view"), productVariantContrller.getVariantByProduct);

router.get('/all/productVariantByProduct/:clientId/:productId', entityAuth.authorizeEntity("Product", "Variant", "view"), productVariantContrller.getAllVariantByProduct);

router.get('/listVariant', entityAuth.authorizeEntity("Product", "Variant", "view"), productVariantContrller.list);

router.post("/softDeleteVariant", entityAuth.authorizeEntity("Product", "Variant", "create"), productVariantContrller.softDelete);


// # create, update, view, list, activate/inactive, delete






exports.router = router;
