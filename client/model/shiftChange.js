const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientShiftChangeSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        chosenShift: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        reason: { type: String, required: true },
        description: { type: String, required: true },

        actionBy: { type: ObjectId, ref: "clientUsers", default: null },
        status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' },
        actionRemark: { type: String, default: null },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = clientShiftChangeSchema;  