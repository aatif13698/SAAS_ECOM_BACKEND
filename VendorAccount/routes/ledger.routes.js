

const express = require("express");
let router = express.Router();



const ledgerController = require("../controller/ledger.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive ledger group

router.post('/create/ledger',uploadCustomFormWithS3.any(), entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerController.create);

router.put('/update/ledger', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), ledgerController.update);

router.get('/get/:clientId/:ledgerId', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), ledgerController.getParticular )

router.get('/list/ledger', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerController.list);

router.post("/activeInactive/ledger", entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerController.activeinactive);

// # create, update, view, list, activate/inactive ledger group


exports.router = router;
