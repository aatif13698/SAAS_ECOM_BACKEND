

const express = require("express");
let router = express.Router();



const employeeContrller = require("../controller/employee.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon, uploadIconToS3 } = require("../../utils/multer");


// # create, update, view, list, activate/inactive, delete Branch by vendor routes starts here

// router.post('/createBranch', entityAuth.authorizeEntity("Branch", "create"), employeeContrller.createBranchByVendor);

// router.post('/createEmployee', entityAuth.authorizeEntity("Administration", "Employee", "create"), (req, res, next) => {
//     uploadBranchIcon.single("icon")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 // MulterError: File too large
//                 return res.status(statusCode.BadRequest).send({
//                     message: 'File too large. Maximum file size allowed is 1 MB.'
//                 });
//             } else {
//                 // Other errors
//                 console.error('Multer Error:', err.message);
//                 return res.status(statusCode.BadRequest).send({
//                     message: err.message
//                 });
//             }
//         }
//         next();
//     });
// }, employeeContrller.create);


router.post(
    '/createEmployee',
    entityAuth.authorizeEntity("Administration", "Employee", "create"),
    uploadIconToS3.single("icon"),
    async (req, res, next) => {
        try {
            // Validate file upload
            if (req.file) {
                const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimetypes.includes(req.file.mimetype)) {
                    return res.status(400).send({
                        message: 'Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.'
                    });
                }
            }
            // Process the request
            await employeeContrller.create(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


// router.put('/updateBranch', entityAuth.authorizeEntity("Branch", "update"), employeeContrller.updateBranchByVendor);

// router.put('/updateEmployee', entityAuth.authorizeEntity("Administration", "Employee", "update"), (req, res, next) => {
//     uploadBranchIcon.single("icon")(req, res, (err) => {
//         if (err) {
//             if (err instanceof multer.MulterError) {
//                 // MulterError: File too large
//                 return res.status(statusCode.BadRequest).send({
//                     message: 'File too large. Maximum file size allowed is 1 MB.'
//                 });
//             } else {
//                 // Other errors
//                 console.error('Multer Error:', err.message);
//                 return res.status(statusCode.BadRequest).send({
//                     message: err.message
//                 });
//             }
//         }
//         next();
//     });
// }, employeeContrller.update);



router.put(
    '/updateEmployee',
    entityAuth.authorizeEntity("Administration", "Employee", "update"),
    uploadIconToS3.single("icon"),
    async (req, res, next) => {
        try {
            // Validate file upload
            if (req.file) {
                const allowedMimetypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedMimetypes.includes(req.file.mimetype)) {
                    return res.status(400).send({
                        message: 'Invalid file type. Only JPEG, PNG, WEBP and GIF are allowed.'
                    });
                }
            }
            // Process the request
            await employeeContrller.update(req, res, next);
        } catch (error) {
            console.error('Upload Error:', error.message);
            return res.status(400).send({
                message: error.message
            });
        }
    }
);


router.get('/employee/:clientId/:employeeId', entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.getParticular);

router.get('/listEmployee', entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.list);

router.get('/list/all/employee/current/level', entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.listAllByCurrentLevel);

router.post("/activeInactiveEmployee", entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.activeinactive);

router.post("/softDeleteEmployee", entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.softDelete);

router.post("/restoreBranch", entityAuth.authorizeEntity("Administration", "Employee", "create"), employeeContrller.restoreBranchByVendor);

router.get('/branchByBusinessUnit/:clientId/:businessUnitId', entityAuth.authorizeEntity("Administration", "Branch", "create"), employeeContrller.getBranchByBusinessUnit);



// # create, update, view, list, activate/inactive, delete Branch by Branch routes ends here






exports.router = router;
