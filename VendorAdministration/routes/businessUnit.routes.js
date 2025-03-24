

const express = require("express");
let router = express.Router();



const vendorBusinessUnitContrller = require("../controller/businessUnit.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBusinesUnitIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Business unit by vendor routes starts here

// router.post('/createBusinessUnit', entityAuth.authorizeEntity("Business Unit", "create"), vendorBusinessUnitContrller.createBusinessUnitByVendor);

router.post('/createBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), (req, res, next) => {
    uploadBusinesUnitIcon.single("icon")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // MulterError: File too large
                return res.status(statusCode.BadRequest).send({
                    message: 'File too large. Maximum file size allowed is 1 MB.'
                });
            } else {
                // Other errors
                console.error('Multer Error:', err.message);
                return res.status(statusCode.BadRequest).send({
                    message: err.message
                });
            }
        }
        next();
    });
}, vendorBusinessUnitContrller.createBusinessUnitByVendor);

// router.put('/updateBusinessUnit', entityAuth.authorizeEntity("Business Unit", "update"), vendorBusinessUnitContrller.updateBusinessUnitByVendor);
router.put('/updateBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "update"), (req, res, next) => {
    uploadBusinesUnitIcon.single("icon")(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                // MulterError: File too large
                return res.status(statusCode.BadRequest).send({
                    message: 'File too large. Maximum file size allowed is 1 MB.'
                });
            } else {
                // Other errors
                console.error('Multer Error:', err.message);
                return res.status(statusCode.BadRequest).send({
                    message: err.message
                });
            }
        }
        next();
    });
}, vendorBusinessUnitContrller.updateBusinessUnitByVendor);

router.get('/businessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.getParticularBusinessUnitByVendor);

router.get('/listBusinessUnit', entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.listBusinessUnit);

router.post("/activeInactiveBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.activeinactiveBusinessUnitByVendor);

router.post("/softDeleteBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.softDeleteBusinesssUnitByVendor);

router.post("/restoreBusinessUnit", entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"), vendorBusinessUnitContrller.restoreBusinessUnitByVendor);

router.get('/getActiveBusinessUnit',
    //  entityAuth.authorizeEntity("Administration", "BusinessUnit", "create"),
      vendorBusinessUnitContrller.getActiveBusinessUnit);



// # create, update, view, list, activate/inactive, delete BusinessUnit by business unit routes ends here






exports.router = router;
