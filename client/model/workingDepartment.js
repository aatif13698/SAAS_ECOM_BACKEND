

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientWorkingDepartmentSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        departmentName: { type: String, required: true },
        departmentCode: { type: String, unique: true, required: true },
        description: { type: String },
        employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers' }],
        headcountLimit: { type: Number },
        status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
        notes: { type: String },
        isActive: { type: Boolean, default: false },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = clientWorkingDepartmentSchema;





