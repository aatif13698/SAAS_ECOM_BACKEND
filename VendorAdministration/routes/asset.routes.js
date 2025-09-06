

const express = require("express");
let router = express.Router();



const assetController = require("../controller/asset.controller");
const entityAuth = require("../../middleware/authorization/commonEntityAuthorization/commonEntityAuthorization");
const { uploadBranchIcon } = require("../../utils/multer");


// # create, update, view, list, activate/inactive woring department

router.post('/create/asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.create);

router.put('/update/asset', entityAuth.authorizeEntity("Administration", "Employee", "update"), assetController.update);

router.get('/shift/:clientId/:asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.getParticular);

router.get('/list/asset', entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.list);

router.post("/activeInactive/asset", entityAuth.authorizeEntity("Administration", "Employee", "create"), assetController.activeinactive);

// # create, update, view, list, activate/inactive  woring department



// // Assign asset to employee
// app.post('/api/assets/:assetId/assign', async (req, res) => {
//   const { employeeId } = req.body;
//   try {
//     const asset = await Asset.findById(req.params.assetId);
//     if (!asset) return res.status(404).json({ error: 'Asset not found' });
//     if (asset.status !== 'available') return res.status(400).json({ error: 'Asset not available' });

//     const employee = await Employee.findById(employeeId);
//     if (!employee) return res.status(404).json({ error: 'Employee not found' });

//     asset.assignedTo = employeeId;
//     asset.status = 'assigned';
//     employee.assignedAssets.push(asset._id);
//     asset.auditLogs.push({ action: 'assigned', user: req.body.createdBy, date: new Date() });
//     await asset.save();
//     await employee.save();
//     res.json(asset);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Unassign asset
// app.delete('/api/assets/:assetId/unassign', async (req, res) => {
//   try {
//     const asset = await Asset.findById(req.params.assetId);
//     if (!asset) return res.status(404).json({ error: 'Asset not found' });

//     const employee = await Employee.findById(asset.assignedTo);
//     if (employee) {
//       employee.assignedAssets = employee.assignedAssets.filter(id => !id.equals(asset._id));
//       await employee.save();
//     }

//     asset.assignedTo = null;
//     asset.status = 'available';
//     asset.auditLogs.push({ action: 'unassigned', user: req.body.updatedBy, date: new Date() });
//     await asset.save();
//     res.json(asset);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Create asset request (e.g., exchange for defective)
// app.post('/api/asset-requests', async (req, res) => {
//   try {
//     const request = new AssetRequest(req.body);
//     await request.save();
//     // Optional: Notify admin via email integration
//     res.status(201).json(request);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Approve/deny request (admin)
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
