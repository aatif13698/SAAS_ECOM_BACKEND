const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const paymentLogSchema = new Schema(
  {
    orderId: { type: ObjectId, ref: "Order", required: true, index: true },
    orderPaymentId: { type: ObjectId, ref: "OrderPayment", required: true, index: true },
    vendorId: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    customerId: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    productId: { type: ObjectId, ref: "Product", required: true, index: true },
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe_card", "razorpay_upi", "razorpay_bank", "stripe_bank"],
      required: true,
    },
    stepIndex: { type: Number, default: null }, // For multi-step payments
    stepName: { type: String, default: null }, // e.g., "Advance", "UPI Payment"
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    attemptStatus: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      required: true,
    },
    errorCode: { type: String }, // Gateway-specific error code
    errorMessage: { type: String }, // User-friendly error message
    transactionId: { type: String }, // Stripe paymentIntentId or Razorpay paymentId
    timestamp: { type: Date, default: Date.now, required: true, index: true },
  },
  { timestamps: true }
);

// Prevent updates to ensure immutability
paymentLogSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  next(new Error("Payment logs are immutable and cannot be updated"));
});

// Indexes for performance and sharding
paymentLogSchema.index({ vendorId: 1, timestamp: 1 }); // For sharding
paymentLogSchema.index({ orderId: 1, timestamp: -1 }); // For order-specific queries
paymentLogSchema.index({ customerId: 1, timestamp: -1 }); // For customer-specific queries

// TTL index to archive logs after 6 months (optional)
paymentLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 6 * 30 * 24 * 60 * 60 });

module.exports = paymentLogSchema;