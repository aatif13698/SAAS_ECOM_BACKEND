

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientVoucharGroupSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        name: { type: String, required: true, unique: true },
        code: { type: String, required: true, unique: true },
        category: { type: String, required: true,  },
        description: { type: String, required: true, },
        isTaxable: { type: Boolean, default: false },
        approvalRequired: { type: Boolean, default: false },
        relatedToInventory: { type: Boolean, default: false },
        gstApplicable: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        resetFrequency: { type: String, enum: ['monthly', 'yearly'] },
        financialYear: { type: mongoose.Schema.Types.ObjectId, ref: 'financialYear', default: null },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = clientVoucharGroupSchema;





