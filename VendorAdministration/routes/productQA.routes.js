const express = require("express");  
let router = express.Router();  

const productQaController = require("../controller/productQA.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  

router.post('/create/productQa', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.create);  

router.get('/get/productQa/:clientId/:productMainStockId', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.getByProductMainStockId);  

router.put('/update/productQa', entityAuth.authorizeEntity("Administration", "Employee", "update"), productQaController.update);  

router.delete('/delete/productQa/:id', entityAuth.authorizeEntity("Administration", "Employee", "update"), productQaController.deleteOne);  

router.get('/list/productQa', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.list);  

router.post("/activeInactive/productQa", entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.activeinactive);  

router.get('/list/productQa/out', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.listQaOut);  

router.get('/get/productQa/out/:clientId/:productMainStockId', entityAuth.authorizeEntity("Administration", "Employee", "create"), productQaController.getQaOutByProductMainStockId);  

router.put('/update/productQa/out', entityAuth.authorizeEntity("Administration", "Employee", "update"), productQaController.updateQaOut);  

router.post('/publish/productQa/:id', entityAuth.authorizeEntity("Administration", "Employee", "update"), productQaController.publishQaOut);  

exports.router = router;  