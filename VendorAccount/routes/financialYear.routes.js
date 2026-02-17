

const express = require("express");
let router = express.Router();



const financialYearController = require("../controller/financialYear.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


// # create, update, view, list, activate/inactive financial year

router.post('/create/financialYear', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.create);

router.get('/list/financialYear', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.list);

router.post("/activeInactive/financialYear", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.activeinactive);

router.put('/update/financialYear', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), financialYearController.update);

router.get('/all/financialYear', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.all);

router.get('/working/financialYear/:clientId', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.workingFy);

router.get('/all/nonworking/financialYear/:clientId', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.allNonWorking);

router.post("/set/working/financialYear", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), financialYearController.setWorking);


// # create, update, view, list, activate/inactive financial year


exports.router = router;
