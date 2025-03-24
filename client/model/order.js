const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema(
    {
        customer: {
            type: ObjectId,
            ref: "clientUsers",
            required: true,
            index: true,
        },
        orderNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        items: [
            {
                productStock: {
                    type: ObjectId,
                    ref: "productStock",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: [1, "Quantity must be at least 1"],
                },
                priceOption: {
                    quantity: { type: Number, required: true },
                    unit: { type: String, required: true },
                    price: { type: Number, required: true },
                },
                customizationDetails: {
                    type: Map,
                    of: String,
                    default: new Map(), // e.g., { "Text": "John", "Color": "Red" }
                },
                subtotal: {
                    type: Number,
                    required: true,
                    default: 0,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            default: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "ONLINE"],
            default: "COD",
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
        },
        address: {
            type: ObjectId,
            ref: "customerAddress",
            required: true,
            index: true, // For efficient lookups
        },
        status: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "IN_PRODUCTION",
                "SHIPPED",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PENDING",
            index: true,
        },
        activities: [
            {
                status: {
                    type: String,
                    enum: [
                        "PENDING",
                        "APPROVED",
                        "IN_PRODUCTION",
                        "SHIPPED",
                        "DELIVERED",
                        "CANCELLED",
                    ],
                    required: true,
                },
                timestamp: {
                    type: Date,
                    default: Date.now,
                    required: true,
                },
                updatedBy: {
                    type: ObjectId,
                    ref: "clientUsers",
                    required: true,
                },
                notes: {
                    type: String, // e.g., "Cancelled due to stock unavailability"
                },
            },
        ],
        createdBy: {
            type: ObjectId,
            ref: "clientUsers",
            required: true,
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

// Pre-save hook to calculate subtotals and total amount
orderSchema.pre("save", function (next) {
    this.items.forEach((item) => {
        item.subtotal = item.quantity * item.priceOption.price;
    });
    this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
    next();
});

// Generate unique order number
orderSchema.pre("save", async function (next) {
    if (!this.orderNumber) {
        const date = new Date().toISOString().slice(0, 10).replace(/-/, "");
        const count = await mongoose.model("Order").countDocuments({
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
        });
        this.orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`;
    }
    next();
});

module.exports = orderSchema;
