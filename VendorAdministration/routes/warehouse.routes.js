

const express = require("express");
let router = express.Router();



const vendorWarehouseContrller = require("../controller/warehouse.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadWarehouseIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Warehouse by vendor routes starts here

// router.post('/createWarehouse', entityAuth.authorizeEntity("Warehouse", "create"), vendorWarehouseContrller.createWarehouseByVendor);
router.post('/createWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), (req, res, next) => {
    uploadWarehouseIcon.single("icon")(req, res, (err) => {
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
}, vendorWarehouseContrller.createWarehouseByVendor);

// router.put('/updateWarehouse', entityAuth.authorizeEntity("Warehouse", "update"), vendorWarehouseContrller.updateWarehouseByVendor);

router.put('/updateWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "update"), (req, res, next) => {
    uploadWarehouseIcon.single("icon")(req, res, (err) => {
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
}, vendorWarehouseContrller.updateWarehouseByVendor);


router.get('/Warehouse/:clientId/:warehouseId', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.getParticularWarehouseByVendor);
router.get('/warehouseByBranch/:clientId/:branchId',  vendorWarehouseContrller.getWarehouseByBranch);

router.get('/listWarehouse', entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.listWarehouse);

router.post("/activeInactiveWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.activeinactiveWarehouseByVendor);

router.post("/softDeleteWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.softDeleteWarehouseByVendor);

router.post("/restoreWarehouse", entityAuth.authorizeEntity("Administration", "Warehouse", "create"), vendorWarehouseContrller.restoreWarehouseByVendor);



// # create, update, view, list, activate/inactive, delete Warehouse by Warehouse routes ends here






exports.router = router;
