const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

// Sub-schema for Shipping Address
const shippingAddressSchema = new Schema({
    fullName: { type: String, trim: true, required: true },
    phone: { type: String, trim: true, required: true },
    alternativePhone: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, required: true },
    state: { type: String, trim: true, required: true },
    city: { type: String, trim: true, required: true },
    ZipCode: { type: String, trim: true, required: true }, // Renamed from ZipCode for consistency
    address: { type: String, trim: true, required: true },
    roadName: { type: String, trim: true, default: "" },
    nearbyLandmark: { type: String, trim: true, default: "" },
    houseNumber: { type: String, trim: true, default: "" },
    _id: { type: ObjectId, default: null } // Optional reference if selectable
}, { _id: false }); // Embed without separate _id for sub-document

// Sub-schema for Item Name details (embedded product info)
const itemNameSchema = new Schema({
    name: { type: String, trim: true, required: true },
    productStock: { type: ObjectId, ref: "productStock", required: true },
    productMainStock: { type: ObjectId, ref: "productMainStock", required: true },
}, { _id: false });

// Sub-schema for Purchase Order Item
const salesInvoiceItemSchema = new Schema({
    srNo: { type: Number, required: true, min: 1 },
    itemName: { type: itemNameSchema, required: true },
    quantity: { type: Number, required: true, min: 1 },
    mrp: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    taxableAmount: { type: Number, default: 0, min: 0 },
    gstPercent: { type: Number, default: 0, min: 0 }, // Overall GST percentage
    cgstPercent: { type: Number, default: 0, min: 0 }, // Central GST
    sgstPercent: { type: Number, default: 0, min: 0 }, // State GST
    igstPercent: { type: Number, default: 0, min: 0 }, // Integrated GST (inter-state)
    cgst: { type: Number, default: 0, min: 0 },
    sgst: { type: Number, default: 0, min: 0 },
    igst: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 }, // Total tax
    totalAmount: { type: Number, default: 0, min: 0 },
    audited: { type: Boolean, default: false },
}, { _id: true }); // Allow _id for individual items if needed for updates

// Sub-schema for Bank Details
const bankDetailsSchema = new Schema({
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true }, // Standardized to uppercase
    branch: { type: String, trim: true }
}, { _id: false });

const saleInvoiceSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        customer: { type: ObjectId, ref: "ClientUser", required: true, index: true },
        customerLedger: { type: ObjectId, ref: 'ledger', required: true },
        shippingAddress: { type: shippingAddressSchema, required: true },
        siNumber: { type: String, trim: true, required: true, unique: true, index: true },
        siDate: { type: Date, default: Date.now, required: true }, // Stored as Date; frontend formats as needed

        // Items array
        items: [salesInvoiceItemSchema],

        // Additional fields
        notes: { type: String, trim: true, default: "" },
        bankDetails: { type: bankDetailsSchema, default: () => ({}) },
        isInterState: { type: Boolean, default: false }, // Determines IGST vs CGST/SGST
        roundOff: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: ["", 'cash', 'cheque', 'bank_transfer', 'online', 'credit'], default: "" }, // Enum for validation
        paidAmount: { type: Number, default: 0, min: 0 },
        receivedIn: [
            {
                id: { type: ObjectId, ref: 'ledger', default: null },
                paymentType: { type: String, default: null },
                linkedId: { type: String, default: null },
                amount: { type: Number, required: true }
            }
        ],
        balance: { type: Number, default: 0, min: 0 },
        grandTotal: { type: Number, default: 0, min: 0 },

        status: { type: String, enum: ['draft', 'issued', 'invoiced', 'partially_invoiced', 'pending_approval', 'approved', 'closed', 'canceled'], default: "draft" },

        auditStatus: { type: String, enum: ['completed', 'pending'], default: "pending" },

        // Audit fields
        createdBy: { type: ObjectId, ref: "ClientUser", required: true, index: true }, // Capitalized for consistency
        deletedAt: { type: Date, default: null, index: true } // For soft deletes
    },
    {
        timestamps: true, // Auto-adds createdAt and updatedAt
        toJSON: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } }, // Hide __v in JSON
        toObject: { virtuals: true, transform: (doc, ret) => { delete ret.__v; return ret; } }
    }
);

// Compound index for common queries (e.g., by business unit and date)
saleInvoiceSchema.index({ businessUnit: 1, poDate: -1 });
saleInvoiceSchema.index({ branch: 1, poDate: -1 });
saleInvoiceSchema.index({ supplier: 1, poDate: -1 });

// Virtual for total order amount (computed)
saleInvoiceSchema.virtual('totalOrderAmount').get(function () {
    return this.items.reduce((sum, item) => sum + item.totalAmount, 0);
});

module.exports = saleInvoiceSchema;