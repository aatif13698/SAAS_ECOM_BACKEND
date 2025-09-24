

const express = require("express");
let router = express.Router();



const voucherGroupController = require("../controller/voucherGroup.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive voucher group


router.post('/create/voucherGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), voucherGroupController.create);

router.get('/list/voucherGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), voucherGroupController.list);

router.post("/activeInactive/voucherGroup", entityAuth.authorizeEntity("Accounting Master", "Group", "create"), voucherGroupController.activeinactive);

router.put('/update/voucherGroup', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), voucherGroupController.update);


// # create, update, view, list, activate/inactive voucher group






exports.router = router;
