

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientAssetRequestSchema = new Schema(
    {
        assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientAsset', required: true },
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true },
        requestType: { type: String, enum: ['exchange', 'repair', 'return'], required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'denied', 'completed'], default: 'pending' },
        notes: { type: String },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers' },
        newAssetId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientAsset' },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);




module.exports = clientAssetRequestSchema;





