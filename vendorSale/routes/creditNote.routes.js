const express = require("express");
let router = express.Router();


const creditNoteController = require("../controller/creditNote.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive creditNote 

router.post('/create/creditNote', entityAuth.authorizeEntity("Administration", "Employee", "create"), creditNoteController.create);

router.post('/apply/credit/to/invoice', entityAuth.authorizeEntity("Purchases", "Payment Out", "create"), creditNoteController.applyCrditToInvoice);

router.post('/issue/creditNote/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), creditNoteController.issueMail);

router.put('/update/creditNote', entityAuth.authorizeEntity("Administration", "Employee", "update"), creditNoteController.update);

router.get('/get/:clientId/:creditNoteId', entityAuth.authorizeEntity("Administration", "Employee", "create"), creditNoteController.getParticular);

router.get('/list/creditNote', entityAuth.authorizeEntity("Administration", "Employee", "create"), creditNoteController.list);

router.post("/change/status/creditNote", entityAuth.authorizeEntity("Administration", "Employee", "create"), creditNoteController.changeStatus);


exports.router = router; 