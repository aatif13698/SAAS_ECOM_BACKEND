const express = require("express");  
let router = express.Router();  

const documentRequirementController = require("../controller/documentRequirements.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  
const { uploadBranchIcon } = require("../../utils/multer");  

// # create, update, view, list, activate/inactive Documents  

router.post('/create/document/requirement', entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.create);  

router.get('/list/document/requirement', entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.list);  

router.post("/activeInactive/document/requirement", entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.activeinactive);  

router.put('/update/document/requirement', entityAuth.authorizeEntity("Human resources", "Documents", "update"), documentRequirementController.update);  

router.get('/all/field/document/requirement', entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.allField);  

router.post("/create/field", entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.createField);  

router.delete('/delete/field/:documentRequirementId/:clientId/:fieldId', entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.deleteField);  

router.post("/update/order/field/:documentRequirementId/:clientId", entityAuth.authorizeEntity("Human resources", "Documents", "create"), documentRequirementController.updateFieldOrder);  

// # create, update, view, list, activate/inactive Documents  

exports.router = router;  