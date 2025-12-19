

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientLedgerGroupSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        groupName: { type: String, required: true, },
        hasParent: { type: Boolean, default: false },
        parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ledgerGroup', default: null }, // For sub-groups
        isActive: { type: Boolean, default: true },

        requiredFields: [{
            fieldId: { type: mongoose.Schema.Types.ObjectId, ref: 'customField', default: null },
        }],

        isMaster: {type: Boolean, default: false},

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = clientLedgerGroupSchema;





