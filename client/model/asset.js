const mongoose = require("mongoose"); 

const { Schema } = mongoose; 
const ObjectId = Schema.ObjectId; 

const clientAssetSchema = new Schema( 
    { 
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true }, 
        branch: { type: ObjectId, ref: "branch", default: null, index: true }, 
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true }, 

        isVendorLevel: { type: Boolean, default: false }, 
        isBuLevel: { type: Boolean, default: false }, 
        isBranchLevel: { type: Boolean, default: false }, 
        isWarehouseLevel: { type: Boolean, default: false }, 

        assetName: { type: String, required: true }, 
        serialNumber: { type: String, unique: true, required: true }, 
        model: { type: String }, 
        purchaseDate: { type: Date }, 
        purchaseCost: { type: Number }, 
        currentValue: { type: Number }, 
        usefulLife: { type: Number }, // in months 
        status: { type: String, enum: ['available', 'assigned', 'in-maintenance', 'defective', 'disposed'], default: 'available' }, 
        condition: { type: String, enum: ['new', 'good', 'fair', 'poor'] }, 
        warrantyEndDate: { type: Date }, 
        disposalDate: { type: Date }, 
        disposalReason: { type: String }, 
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', default: null }, 
        notes: { type: String }, 
        expirationDate: { type: Date }, 
        auditLogs: [{ 
            action: { type: String }, 
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers' }, 
            logDate: { type: Date, default: Date.now }, 
            status: { type: String, enum: ['healthy', 'warning', 'defective'] }, 
            defectInterval: { type: Number }, // e.g., days since last defect 
            notes: { type: String }, 
        }], 
        isActive: { type: Boolean, default: false }, 

        createdBy: { type: ObjectId, ref: "clientUsers", index: true }, 
        updatedBy: { type: ObjectId, ref: 'clientUsers' }, 
        updatedAt: { type: Date, default: null, index: true }, 
        deletedAt: { type: Date, default: null, index: true }, 
    }, 
    { timestamps: true } 
); 


module.exports = clientAssetSchema; 