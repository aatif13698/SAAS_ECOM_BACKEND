

const express = require("express");
let router = express.Router();



const statementController = require("../controller/statement.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadProductBlueprintToS3 } = require("../../utils/multer");


// # create, update, view, list, activate/inactive 

router.post('/create/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.create);

router.get('/list/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.list);

router.post("/activeInactive/statement", entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.activeinactive);

router.put('/update/statement', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "update"), statementController.update);

router.get('/get/statement/:clientId/:type', statementController.statementType);



router.post(
    '/create/about',
    entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"),
    uploadProductBlueprintToS3.array("file", 3),
    async (req, res, next) => {
        try {
            // Validate file uploads
            if (req.files && req.files.length > 0) {
                const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                for (const file of req.files) {
                    if (!allowedMimetypes.includes(file.mimetype)) {
                        return res.status(400).send({
                            message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
                        });
                    }
                }
            }

            // Process the request
            await statementController.createAbout(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);



router.post(
    '/update/about',
    entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"),
    uploadProductBlueprintToS3.array("file", 3),
    async (req, res, next) => {
        try {
            // Validate file uploads
            if (req.files && req.files.length > 0) {
                const allowedMimetypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
                for (const file of req.files) {
                    if (!allowedMimetypes.includes(file.mimetype)) {
                        return res.status(400).send({
                            message: 'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed.'
                        });
                    }
                }
            }

            // Process the request
            await statementController.updateAbout(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.get('/list/about', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.listAbout);

router.get('/get/about/:clientId/:id', entityAuth.authorizeEntity("Accounting Master", "Financial Year", "create"), statementController.aboutById);


// # create, update, view, list, activate/inactive


exports.router = router;
