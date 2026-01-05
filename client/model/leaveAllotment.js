const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const leaveAllotmentSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        workingDepartment: { type: ObjectId, ref: "clientWorkingDepartment", default: null, index: true },

        leaveCategories: [ 
            { 
                id: { 
                    type: ObjectId, 
                    ref: "leaveCategory", 
                    required: true, 
                }, 
                allocated: { type: Number, default: 0 }, 
            } 
        ], 

        isActive: { type: Boolean, default: false },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = leaveAllotmentSchema;  