

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const ledgerSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        // Ledger Details
        ledgerName: { type: String, required: true, trim: true },
        alias: { type: String, required: true, trim: true, unique: true, index: true },
        ledgerGroupId: { type: Schema.Types.ObjectId, ref: "ledgerGroup", required: true, index: true },
        ledgerType: { type: String, required: true, trim: true },

        // Entity Type (only one can be true)
        isCustomer: { type: Boolean, default: false },
        isSupplier: { type: Boolean, default: false },
        isEmployee: { type: Boolean, default: false },
        isNone: { type: Boolean, default: false },

        // Transaction Type (only one can be true)
        isCredit: { type: Boolean, default: false },
        isDebit: { type: Boolean, default: false },

        // Financial Details
        currency: { type: String, required: true, trim: true },
        currencySymbol: { type: String, required: true, trim: true },
        creditLimit: { type: Number, required: true, min: [0, "Credit limit cannot be negative"] },
        creditDays: { type: Number, required: true, min: [0, "Credit days cannot be negative"] },
        openingBalance: { type: Number, default: 0 },
        openingDate: { type: Date, default: null, index: true },
        balance: { type: Number, default: 0 },
        overdueAmount: { type: Number, default: 0 },
        outstandingAmount: { type: Number, default: 0 },

        // Transaction Metadata
        lastTransactionDate: { type: Date, default: null, index: true },
        referenceNumber: { type: String, default: null, trim: true },

        isActive: { type: Boolean, default: true },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);



// Validation: Ensure only one of isCustomer, isSupplier, isEmployee is true
ledgerSchema.path("isCustomer").validate(function () {
  const count = [this.isCustomer, this.isSupplier, this.isEmployee].filter(Boolean).length;
  return count <= 1;
}, "Only one of isCustomer, isSupplier, or isEmployee can be true.");

// Validation: Ensure only one of isCredit, isDebit is true
ledgerSchema.path("isCredit").validate(function () {
  return !(this.isCredit && this.isDebit);
}, "Only one of isCredit or isDebit can be true.");

module.exports = ledgerSchema;





