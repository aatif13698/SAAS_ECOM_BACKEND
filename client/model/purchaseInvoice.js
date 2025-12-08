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
const purchaseOrderItemSchema = new Schema({
    srNo: { type: Number, required: true, min: 1 },
    itemName: { type: itemNameSchema, required: true }, // Embedded for simplicity; consider ref if separate Product model
    quantity: { type: Number, required: true, min: 1 },
    mrp: { type: Number, default: 0, min: 0 }, // Maximum Retail Price
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
    totalAmount: { type: Number, default: 0, min: 0 }
}, { _id: true }); // Allow _id for individual items if needed for updates

// Sub-schema for Bank Details
const bankDetailsSchema = new Schema({
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscCode: { type: String, trim: true, uppercase: true }, // Standardized to uppercase
    branch: { type: String, trim: true }
}, { _id: false });

const purchaseInvoiceSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },  
        branch: { type: ObjectId, ref: "branch", default: null, index: true },  
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },  

        isVendorLevel: { type: Boolean, default: false },  
        isBuLevel: { type: Boolean, default: false },  
        isBranchLevel: { type: Boolean, default: false },  
        isWarehouseLevel: { type: Boolean, default: false },  


        // Core PO fields
        supplier: { type: ObjectId, ref: "supplier", required: true, index: true }, // Assumed ref to Supplier model
        shippingAddress: { type: shippingAddressSchema, required: true },
        piNumber: { type: String, trim: true, required: true, unique: true, index: true }, // Unique for business integrity
        piDate: { type: Date, default: Date.now, required: true }, // Stored as Date; frontend formats as needed

        // Items array
        items: [purchaseOrderItemSchema],

        // Additional fields
        notes: { type: String, trim: true, default: "" },
        bankDetails: { type: bankDetailsSchema, default: () => ({}) },
        isInterState: { type: Boolean, default: false }, // Determines IGST vs CGST/SGST
        roundOff: { type: Boolean, default: false },
        paymentMethod: { type: String, enum: ['cash', 'cheque', 'bank_transfer', 'online', 'credit'], default: "" }, // Enum for validation
        paidAmount: { type: Number, default: 0, min: 0 },
        balance: { type: Number, default: 0, min: 0 },

        status: { type: String, enum: ['draft', 'received', 'verified', 'approved', 'paid', 'partially_paid', 'overdue', 'disputed', 'canceled', 'closed'], default: "draft" },
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
purchaseInvoiceSchema.index({ businessUnit: 1, poDate: -1 });
purchaseInvoiceSchema.index({ branch: 1, poDate: -1 });
purchaseInvoiceSchema.index({ supplier: 1, poDate: -1 });

// Virtual for total order amount (computed)
purchaseInvoiceSchema.virtual('totalOrderAmount').get(function () {
    return this.items.reduce((sum, item) => sum + item.totalAmount, 0);
});

module.exports = purchaseInvoiceSchema;