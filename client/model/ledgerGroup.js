

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

        name: { type: String, required: true, unique: true },
        parentGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'ledgerGroup', default: null }, // For sub-groups
        requiredFields: [{
            field: { type: String, required: true },
            type: { type: String, enum: ['string', 'number', 'date', 'array'], required: true },
            required: { type: Boolean, default: true }
        }],

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);


module.exports = clientLedgerGroupSchema;





