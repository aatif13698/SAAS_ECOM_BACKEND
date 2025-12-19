const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const overTimeRuleSchema = new Schema(
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
            enum: ['max_ot_per_month', 'ot_rate_multiplier', 'min_ot_for_approval', 'other'],
            required: true
        },
        name: { type: String, required: true }, // e.g., "Max 20 OT Hours/Month"
        description: { type: String, required: true },
        active: { type: Boolean, default: true },
        period: { type: String, enum: ['month', 'week', 'year'], default: 'month' },
        params: { type: Schema.Types.Mixed, required: true }, // { maxMinutes: 1200, multiplier: 1.5 }

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },

    },
    { timestamps: true }
);

module.exports = overTimeRuleSchema; 