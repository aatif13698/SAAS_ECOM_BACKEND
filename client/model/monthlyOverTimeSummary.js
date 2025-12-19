const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const monthlyOverTimeSummarySchema = new Schema(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true },
        year: { type: Number, required: true },     // 2025
        month: { type: Number, required: true },    // 1-12

        assigned: { type: Boolean, default: false }, // Admin assigns OT eligibility for this month

        totalNormalOTMinutes: { type: Number, default: 0 },
        totalWeekendOTMinutes: { type: Number, default: 0 },
        totalHolidayOTMinutes: { type: Number, default: 0 },

        totalApprovedMinutes: { type: Number, default: 0 },
        totalPaidMinutes: { type: Number, default: 0 }, // After payroll processing
        payrollProcessed: { type: Boolean, default: false },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        deletedAt: { type: Date, default: null },

    },
    { timestamps: true }
);

module.exports = monthlyOverTimeSummarySchema; 