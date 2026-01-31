

const express = require("express");
let router = express.Router();



const salePaymentInConfig = require("../controller/salePaymentInConfigure.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive sale payment configure

router.post('/upsert/sale/payement/ledger/config', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), salePaymentInConfig.upsertPaymentInConfig);

router.get('/get/sale/payement/ledger/config', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), salePaymentInConfig.getPaymentInConfigs);

router.get('/get/sale/payement/in/from/ledger/config', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), salePaymentInConfig.getPaymentInFromConfigs);


// router.put('/update/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), salePaymentInConfig.update);

// router.delete('/delete/field/:groupId/:clientId/:fieldId', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), salePaymentInConfig.deleteField);


// # create, update, view, list, activate/inactive sale payment configure






exports.router = router;
