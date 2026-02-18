const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const paymentOutSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },
        financialYear: { type: ObjectId, ref: "financialYear", default: null, index: true },


        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        paymentOutNumber: { type: String, trim: true, required: true, unique: true, index: true },

        supplier: { type: ObjectId, ref: "supplier", required: true, index: true },
        supplierLedger: { type: ObjectId, ref: 'ledger', required: true },

        paymentOutDate: { type: Date, default: Date.now, required: true },
        paymentMethod: { type: String, enum: ["", 'cash', 'cheque', 'bank_transfer', 'online', 'credit'], default: "" }, // Enum for validation
        paidAmount: { type: Number, required: true, },
        payedFrom: [{ id: { type: ObjectId, ref: 'ledger', default: null } }],
        notes: { type: String },

        linkedId: { type: String, default: null },

        createdBy: { type: ObjectId, ref: "ClientUser", required: true, index: true }, // Capitalized for consistency
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = paymentOutSchema;  