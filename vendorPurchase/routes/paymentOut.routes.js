const express = require("express");
let router = express.Router();


const paymentOutController = require("../controller/paymentOut.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


router.post('/create/purchaseInvoice', entityAuth.authorizeEntity("Administration", "Employee", "create"), paymentOutController.create);


exports.router = router; 