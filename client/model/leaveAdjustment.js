
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const leaveAdjustmentSchema = new Schema(
    {
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true },

        leaveTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'leaveCategory',
            required: true
        },

        year: { type: Number, required: true },
        adjustmentDays: { type: Number, required: true }, // +ve = credit, -ve = debit
        reason: { type: String, required: true }, // "Comp-off earned", "LOP correction", etc.
        adjustedBy: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true }, // HR/Admin
        remarks: String,

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = leaveAdjustmentSchema; 