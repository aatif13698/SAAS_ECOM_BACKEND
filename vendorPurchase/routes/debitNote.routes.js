const express = require("express");
let router = express.Router();


const debitController = require("../controller/debitNote.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive debitNote 

router.post('/create/debitNote', entityAuth.authorizeEntity("Administration", "Employee", "create"), debitController.create);

router.post('/apply/credit/to/invoice', entityAuth.authorizeEntity("Purchases", "Payment Out", "create"), debitController.applyCrditToInvoice);


router.post('/issue/debitNote/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), debitController.issueMail);

router.put('/update/debitNote', entityAuth.authorizeEntity("Administration", "Employee", "update"), debitController.update);

router.get('/get/:clientId/:debitNoteId', entityAuth.authorizeEntity("Administration", "Employee", "create"), debitController.getParticular);

router.get('/list/debitNote', entityAuth.authorizeEntity("Administration", "Employee", "create"), debitController.list);

router.post("/change/status/debitNote", entityAuth.authorizeEntity("Administration", "Employee", "create"), debitController.changeStatus);


exports.router = router; 