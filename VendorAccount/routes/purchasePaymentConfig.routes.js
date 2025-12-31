

const express = require("express");
let router = express.Router();



const purchasePaymentConfig = require("../controller/purchasePaymentConfig.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive purchase payment configure

router.post('/upsert/purhcase/payement/ledger/config', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), purchasePaymentConfig.upsertPaymentConfig);

router.get('/get/purhcase/payement/ledger/config', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), purchasePaymentConfig.getPaymentConfigs);

// router.put('/update/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), purchasePaymentConfig.update);

// router.delete('/delete/field/:groupId/:clientId/:fieldId', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), purchasePaymentConfig.deleteField);


// # create, update, view, list, activate/inactive purchase payment configure






exports.router = router;
