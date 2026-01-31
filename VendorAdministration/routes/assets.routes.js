

const express = require("express");
let router = express.Router();



const assetController = require("../controller/assets.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/asset', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.create);

router.put('/update/asset', entityAuth.authorizeEntity("Human resources", "Employee", "update"), assetController.update);

router.get('/get/:clientId/:asset', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.getParticular);

router.get('/list/asset', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.list);

router.post("/activeInactive/asset", entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.activeinactive);

router.post('/assign/asset', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.assign );

router.get('/get/assest/of/employee/:clientId/:empId', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.getAssetsOfEmployee);


// router.post('/asset/:assetId/unassign', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.unAssign );

router.post('/create/asset/request', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.createRequest );

router.get('/list/asset/request', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.listAssetRequest);

router.get('/list/asset/request/of/employee/:clientId/:empId', entityAuth.authorizeEntity("Human resources", "Assets & Tools", "create"), assetController.getAssetRequestOfEmployee);


// # create, update, view, list, activate/inactive  woring department


// app.patch('/api/asset-requests/:requestId', async (req, res) => {
//   const { status, approvedBy } = req.body;
//   try {
//     const request = await AssetRequest.findById(req.params.requestId).populate('assetId');
//     if (!request) return res.status(404).json({ error: 'Request not found' });

//     request.status = status;
//     request.approvedBy = approvedBy;
//     if (status === 'approved' && request.requestType === 'exchange') {
//       // Logic for exchange: Mark old asset defective, assign new one (simplified)
//       request.assetId.status = 'defective';
//       await request.assetId.save();
//       // In full system, assign a new asset here
//     }
//     await request.save();
//     res.json(request);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });




exports.router = router;
