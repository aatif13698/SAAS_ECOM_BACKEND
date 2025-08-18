const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const orderPaymentSchema = new Schema(
  {
    orderId: { type: ObjectId, ref: "Order", required: true, index: true },
    vendorId: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    customerId: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    totalAmount: { type: Number, required: true, min: [0, "Total amount cannot be negative"] },
    currency: { type: String, required: true, default: "INR" }, // ISO 4217 currency code
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe_card", "razorpay_upi", "razorpay_bank", "stripe_bank"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PARTIALLY_PAID", "PAID", "FAILED"],
      default: "PENDING",
      index: true,
    },
    steps: [
      {
        name: { type: String, required: true }, // e.g., "Advance", "Full Payment"
        percentage: { type: Number, required: true, min: 0, max: 100 },
        amount: { type: Number, required: true, min: 0 },
        status: {
          type: String,
          enum: ["PENDING", "PAID", "FAILED"],
          default: "PENDING",
        },
        dueDate: { type: Date, required: true },
        paymentIntentId: { type: String }, // Stripe: card or bank transfer
        razorpayOrderId: { type: String }, // Razorpay: UPI or bank transfer
        virtualAccount: { // For razorpay_bank
          accountNumber: { type: String },
          ifsc: { type: String },
          bankName: { type: String },
        },
        transactionId: { type: String }, // Final transaction ID after confirmation
      },
    ],
    codStatus: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "FAILED"],
      default: "PENDING",
    },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Pre-save hook to validate steps and total amount
orderPaymentSchema.pre("save", function (next) {
  const totalPercentage = this.steps.reduce((sum, step) => sum + step.percentage, 0);
  if (this.paymentMethod !== "cod" && totalPercentage !== 100) {
    return next(new Error("Payment steps must sum to 100% for non-COD payments"));
  }
  const calculatedTotal = this.steps.reduce((sum, step) => sum + step.amount, 0);
  if (calculatedTotal !== this.totalAmount) {
    return next(new Error("Sum of step amounts must equal totalAmount"));
  }
  next();
});

// Index for sharding and performance
orderPaymentSchema.index({ vendorId: 1, createdAt: 1 }); // For sharding
orderPaymentSchema.index({ orderId: 1 }, { unique: true }); // One payment per order

module.exports = orderPaymentSchema;