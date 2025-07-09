

const express = require("express");
let router = express.Router();



const attributesContrller = require("../controller/attributes.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")


// # create, update, view, list, activate/inactive, delete Attributes by vendor routes starts here

router.post('/createAttributes', entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.createAttributes);

router.put('/updateAttributes', entityAuth.authorizeEntity("Product", "Attribute", "update"), attributesContrller.updateAttributes);

router.get('/attributes/:clientId/:AttributesId', entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.getParticularAttributes);

router.get('/attributes/product/:clientId/:productId', entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.getAttributesOfProduct);

router.get('/listAttributes', entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.listAttributes);
router.get('/getActiveAttributes/:clientId', entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.getActive);

router.post("/activeInactiveAttributes", entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.activeinactiveAttributes);

router.post("/softDeleteAttributes", entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.softDeleteAttributes);

router.post("/restoreAttributes", entityAuth.authorizeEntity("Product", "Attribute", "create"), attributesContrller.restoreAttributes);



// # create, update, view, list, activate/inactive, delete Attributes by Attributes routes ends here






exports.router = router;
