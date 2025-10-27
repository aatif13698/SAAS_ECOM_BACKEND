

const express = require("express");
let router = express.Router();



const productQaController = require("../controller/productQA.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");


router.post('/create/productQa', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.create);

router.put('/update/productQa', entityAuth.authorizeEntity("Administration", "Employee", "update"), productQaController.update);

router.get('/get/:clientId/:productQa', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.getParticular);

router.get('/list/productQa', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.list);

router.post("/activeInactive/productQa", entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.activeinactive);




exports.router = router;
