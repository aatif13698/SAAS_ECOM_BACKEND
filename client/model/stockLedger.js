const mongoose = require('mongoose');


const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const stockLedgerSchema = new mongoose.Schema({
    businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
    branch: { type: ObjectId, ref: "branch", default: null, index: true },
    warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

    isVendorLevel: { type: Boolean, default: false },
    isBuLevel: { type: Boolean, default: false },
    isBranchLevel: { type: Boolean, default: false },
    isWarehouseLevel: { type: Boolean, default: false },

    productMainStock: { type: ObjectId, ref: "productMainStock", required: true },

    pricePerUnit: { type: Number, default: 0 },

    in: { type: Number, default: 0 },
    out: { type: Number, default: 0 },
    totalStock: { type: Number, default: 0 },

    purchaseInvoiceId: { type: ObjectId, ref: "purchaseInvoice", default: null },
    saleInvoiceId: { type: ObjectId, ref: "purchaseInvoice", default: null },

    date: { type: Date },

    type: { type: String, enum: ['opening', 'purchase', 'purchase_return', 'sale', 'sale_return'], required: true }, // Enum for validation

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "clientUsers", index: true },
}, { timestamps: true });

module.exports = stockLedgerSchema;
