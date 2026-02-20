const express = require("express");  
let router = express.Router();  

const documentRequirementController = require("../controller/documentRequirements.controller");  
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");  
const { uploadBranchIcon, uploadCustomFormWithS3 } = require("../../utils/multer");  

// # create, update, view, list, activate/inactive Document Type  

router.post('/create/document/requirement', entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.create);  

router.get('/list/document/requirement', entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.list);  

router.post("/activeInactive/document/requirement", entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.activeinactive);  

router.put('/update/document/requirement', entityAuth.authorizeEntity("Human resources", "Document Type", "update"), documentRequirementController.update);  

router.get('/all/field/document/requirement', entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.allField);  
router.get('/get/document/requirement/by/:clientId/:roleId',  documentRequirementController.docRequiremntByRoleId);  

router.post('/submit/document/requirement', uploadCustomFormWithS3.any(), documentRequirementController.submitCustomDocData);  
router.get('/get/doc/custom/data/:clientId/:userId', documentRequirementController.getDocCustomData )


router.post("/create/field", entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.createField);  

router.delete('/delete/field/:documentRequirementId/:clientId/:fieldId', entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.deleteField);  

router.post("/update/order/field/:documentRequirementId/:clientId", entityAuth.authorizeEntity("Human resources", "Document Type", "create"), documentRequirementController.updateFieldOrder);  

// # create, update, view, list, activate/inactive Document Type  

exports.router = router;  