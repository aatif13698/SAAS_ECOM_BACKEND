const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const cartSchema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: "clientUsers",
      index: true,
      required: function () {
        return !this.isGuest; // Required if not a guest cart
      },
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
    sessionId: {
      type: String,
      index: true,
      required: function () {
        return this.isGuest; // Required for guest carts
      },
    },
    items: [
      {
        productStock: {
          type: ObjectId,
          ref: "productStock",
          required: true,
        },
        productMainStock: {
          type: ObjectId,
          ref: "productMainStock",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        customizationDetails: {
          type: Map,
          of: Schema.Types.Mixed, // Supports strings, numbers, booleans, etc.
          default: new Map(),
        },
        customizationFiles: [
          {
            fieldName: { type: String, required: true }, // e.g., "DesignFile"
            fileUrl: { type: String, required: true }, // Stored file path/URL
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number },
          },
        ],
        priceOption: {
          quantity: { type: Number, required: true },
          unitPrice: { type: String, required: true },
          price: { type: Number, required: true },
          hasDiscount: { type: Boolean, default: false },
          discountPercent: { type: Number, default: 0 }
        },
        subtotal: {
          type: Number,
          required: true,
          default: 0,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      index: { expires: "7d" }, // Auto-expire guest carts after 7 days
      default: function () {
        return this.isGuest ? Date.now() + 7 * 24 * 60 * 60 * 1000 : null;
      },
    },
    status: {
      type: String,
      enum: ["active", "abandoned", "converted"],
      default: "active",
    },
    createdBy: {
      type: ObjectId,
      ref: "clientUsers",
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to calculate subtotal and total amount
cartSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.priceOption.price;
  });
  this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  this.lastModified = Date.now();
  next();
});

// Index for efficient querying
cartSchema.index({ user: 1, status: 1 });
cartSchema.index({ sessionId: 1, status: 1 });


module.exports = cartSchema;