

const express = require("express");
let router = express.Router();



const voucherController = require("../controller/voucher.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive voucher 


router.post('/create/voucher', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), voucherController.create);
router.put('/update/voucher', entityAuth.authorizeEntity("Accounting Master", "Group", "update"), voucherController.update);

router.get('/get/:clientId/:voucherLinkId', entityAuth.authorizeEntity("Accounting Master", "Group", "update"),voucherController.getOne )

router.get('/list/voucher', entityAuth.authorizeEntity("Accounting Master", "Group", "create"), voucherController.list);



// # create, update, view, list, activate/inactive voucher 






exports.router = router;
