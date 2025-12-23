const mongoose = require("mongoose");  

const { Schema } = mongoose;  
const ObjectId = Schema.ObjectId;  

const leaveCategorySchema = new Schema(  
    {  
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },  
        branch: { type: ObjectId, ref: "branch", default: null, index: true },  
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },  

        isVendorLevel: { type: Boolean, default: false },  
        isBuLevel: { type: Boolean, default: false },  
        isBranchLevel: { type: Boolean, default: false },  
        isWarehouseLevel: { type: Boolean, default: false },  

        name: { type: String, required: true, trim: true },  
        code: { type: String, required: true, trim: true },  
        description: { type: String, trim: true },  
        maxLimit: { type: Number, default: 0, min: 0 },   // Maximum leave balance allowed (e.g., 5 days for sick leave).  
        carryOverLimit: { type: Number, default: 0, min: 0 },   // Maximum leave that can be carried over to the next year.  
        defaultEntitlement: { type: Number, default: 0, min: 0 },  // Default leave allocation per year (e.g., 10 days for casual).  
        requiresApproval: { type: Boolean, default: true },  
        isLossOfPay: { type: Boolean, default: true },  
        isEarnedLeave: { type: Boolean, default: true },  

        isActive: { type: Boolean, default: false },  
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },  
        updatedBy: { type: ObjectId, ref: 'clientUsers' },  
        updatedAt: { type: Date, default: null, index: true },  
        deletedAt: { type: Date, default: null, index: true },  
    },  
    { timestamps: true }  
);  


module.exports = leaveCategorySchema;  