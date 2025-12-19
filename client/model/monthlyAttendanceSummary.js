const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const monthlyAttendanceSummarySchema = new Schema(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true },
        year: { type: Number, required: true },
        month: { type: Number, required: true },

        totalLateIns: { type: Number, default: 0 },
        totalEarlyIns: { type: Number, default: 0 },
        totalLateOuts: { type: Number, default: 0 },
        totalEarlyOuts: { type: Number, default: 0 },

        adjustedLateIns: { type: Number, default: 0 }, // After compensations
        appliedDeductionsDays: { type: Number, default: 0 }, // Total deducted days from rules
        appliedRules: [{ // Audit of applied rules
            ruleId: { type: Schema.Types.ObjectId, ref: 'attendanceRule' },
            appliedCount: Number,
            deduction: Number
        }],

        payrollProcessed: { type: Boolean, default: false },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = monthlyAttendanceSummarySchema; 