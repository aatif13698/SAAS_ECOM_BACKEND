

const express = require("express");
let router = express.Router();
const statusCode = require("../../utils/http-status-code")

const manufacturerContrller = require("../controller/manufacturer.controller");

const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization")

const {
    uploadManufacturerIcon,
} = require('../../utils/multer');



// # create, update, view, list, activate/inactive, delete manufacturer by vendor routes starts here

router.post('/createManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "create"), (req, res, next) => {
    uploadManufacturerIcon.single("icon")(req, res, (err) => {
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
}, manufacturerContrller.create);


router.post('/updateManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "update"), (req, res, next) => {
    uploadManufacturerIcon.single("icon")(req, res, (err) => {
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
}, manufacturerContrller.update);


router.get('/manufacturer/:manufacturerId', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.getParticulae);

router.get('/listManufacturer', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.list);
router.get('/getActiveManufacturer/:clientId', entityAuth.authorizeEntity("Product", "Manufacturer", "view"), manufacturerContrller.getActive);

router.post("/activeInactiveManufacturer", entityAuth.authorizeEntity("Product", "Manufacturer", "update"), manufacturerContrller.activeinactive);

router.post("/softDeleteManufacturer", entityAuth.authorizeEntity("Product", "Manufacturer", "softDelete"), manufacturerContrller.softDelete);




// # create, update, view, list, activate/inactive, delete manufacturer by vendor routes ends here






exports.router = router;
