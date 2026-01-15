const express = require("express");
let router = express.Router();


const paymentOutController = require("../controller/paymentOut.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


router.post('/create/payment/out', entityAuth.authorizeEntity("Purchases", "Payment Out", "create"), paymentOutController.create);

router.get('/list/payment/out', entityAuth.authorizeEntity("Purchases", "Payment Out", "view"), paymentOutController.list);

router.get('/get/payment/out/:id/:clientId', entityAuth.authorizeEntity("Purchases", "Payment Out", "view"), paymentOutController.getParticularPaymentOut);


exports.router = router; 