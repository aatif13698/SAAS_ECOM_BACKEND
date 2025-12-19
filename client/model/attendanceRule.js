const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const attendanceRuleSchema = new Schema(
    {

        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        ruleType: {
            type: String,
            enum: ['late_deduction', 'early_compensation', 'early_out_deduction', 'other'], // Extend as needed
            required: true
        },
        name: { type: String, required: true }, // e.g., "3 Lates = Half Day Deduct"
        description: { type: String, required: true },
        active: { type: Boolean, default: true },
        period: { type: String, enum: ['month', 'week', 'year'], default: 'month' },
        params: { type: Schema.Types.Mixed, required: true }, // { threshold: 3, action: 'deduct', value: 0.5, unit: 'days' }

        eatedBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },

    },
    { timestamps: true }
);

module.exports = attendanceRuleSchema; 