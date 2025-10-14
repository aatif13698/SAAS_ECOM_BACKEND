

const express = require("express");
let router = express.Router();



const assetController = require("../controller/assets.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.create);

router.put('/update/asset', entityAuth.authorizeEntity("Administration", "Employee", "update"), assetController.update);

router.get('/get/:clientId/:asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.getParticular);

router.get('/list/asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.list);

router.post("/activeInactive/asset", entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.activeinactive);

// router.post('/asset/:assetId/assign', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.assign );

// router.post('/asset/:assetId/unassign', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.unAssign );

router.post('/create/asset/request', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.createRequest );


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
