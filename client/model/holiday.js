const mongoose = require("mongoose"); 

const { Schema } = mongoose; 
const ObjectId = Schema.ObjectId; 

const holidaySchema = new Schema( 
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
        startDate: { type: Date, required: true }, 
        endDate: { type: Date, required: true }, 
        isHalfDay: { type: Boolean, default: false }, 

        isActive: { type: Boolean, default: false }, 
        createdBy: { type: ObjectId, ref: "clientUsers", index: true }, 
        updatedBy: { type: ObjectId, ref: 'clientUsers' }, 
        updatedAt: { type: Date, default: null, index: true }, 
        deletedAt: { type: Date, default: null, index: true }, 
    }, 
    { timestamps: true } 
); 


module.exports = holidaySchema; 