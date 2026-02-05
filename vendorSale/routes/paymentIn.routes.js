const express = require("express");
let router = express.Router();


const paymentInController = require("../controller/paymentIn.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


router.post('/create/payment/in', entityAuth.authorizeEntity("Purchases", "Payment Out", "create"), paymentInController.create);

router.get('/list/payment/in', entityAuth.authorizeEntity("Purchases", "Payment Out", "view"), paymentInController.list);

router.get('/get/payment/in/:id/:clientId', entityAuth.authorizeEntity("Purchases", "Payment Out", "view"), paymentInController.getParticularPaymentOut);


exports.router = router; 