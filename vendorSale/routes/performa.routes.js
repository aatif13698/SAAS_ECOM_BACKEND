const express = require("express");
let router = express.Router();


const performaController = require("../controller/performa.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive performa 

router.post('/create/performa', entityAuth.authorizeEntity("Administration", "Employee", "create"), performaController.create);

router.post('/issue/performa/mail', entityAuth.authorizeEntity("Administration", "Employee", "create"), performaController.issueMail);

router.put('/update/performa', entityAuth.authorizeEntity("Administration", "Employee", "update"), performaController.update);

router.get('/get/:clientId/:performaId', entityAuth.authorizeEntity("Administration", "Employee", "create"), performaController.getParticular);

router.get('/list/performa', entityAuth.authorizeEntity("Administration", "Employee", "create"), performaController.list);

router.post("/change/status/performa", entityAuth.authorizeEntity("Administration", "Employee", "create"), performaController.changeStatus);


exports.router = router; 