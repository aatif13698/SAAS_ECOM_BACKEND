

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const documentRequirementSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        workDdepartment: { type: ObjectId, ref: "clientWorkingDepartment", default: null, index: true },
        jobRole: { type: ObjectId, ref: "clientRoles", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        name: { type: String, required: true, unique: true },
        isActive: { type: Boolean, default: true },

        requiredFields: [{
            fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'customField', default: null },
        }],

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = documentRequirementSchema;





