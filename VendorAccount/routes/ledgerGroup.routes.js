

const express = require("express");
let router = express.Router();



const ledgerGroupController = require("../controller/ledgerGroup.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive ledger group

router.post('/create/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.create);

router.get('/list/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.list);

router.get('/all/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.allLedgerGroup);

router.get('/all/non/parent/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.all);

router.post("/activeInactive/ledgerGroup", entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.activeinactive);

router.put('/update/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), ledgerGroupController.update);

router.get('/all/field/ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.allField);

router.post("/create/field", entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.createField);

router.delete('/delete/field/:groupId/:clientId/:fieldId', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.deleteField);

router.post("/update/order/field/:groupId/:clientId", entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.updateFieldOrder);









router.get('/shift/:clientId/:ledgerGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), ledgerGroupController.getParticular);



// # create, update, view, list, activate/inactive ledger group






exports.router = router;
