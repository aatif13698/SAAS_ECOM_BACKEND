// const mongoose = require("mongoose");
// const { Schema } = mongoose;
// const ObjectId = Schema.ObjectId;

// const orderSchema = new Schema(
//     {
//         customer: {
//             type: ObjectId,
//             ref: "clientUsers",
//             required: true,
//             index: true,
//         },
//         // orderNumber: {
//         //     type: String,
//         //     unique: true,
//         //     required: true,
//         //     index: true,
//         // },
//         items: [
//             {
//                 productStock: {
//                     type: ObjectId,
//                     ref: "productStock",
//                     required: true,
//                 },
//                 quantity: {
//                     type: Number,
//                     required: true,
//                     min: [1, "Quantity must be at least 1"],
//                 },
//                 priceOption: {
//                     quantity: { type: Number, required: true },
//                     unit: { type: String, required: true },
//                     price: { type: Number, required: true },
//                 },
//                 customizationDetails: {
//                     type: Map,
//                     of: Schema.Types.Mixed, // Supports strings, numbers, booleans, etc.
//                     default: new Map(),
//                 },
//                 customizationFiles: [
//                     {
//                         fieldName: { type: String, required: true }, // e.g., "DesignFile"
//                         fileUrl: { type: String, required: true }, // Stored file path/URL
//                         originalName: { type: String },
//                         mimeType: { type: String },
//                         size: { type: Number },
//                     },
//                 ],
//                 subtotal: {
//                     type: Number,
//                     required: true,
//                     default: 0,
//                 },
//             },
//         ],
//         totalAmount: {
//             type: Number,
//             required: true,
//             default: 0,
//         },
//         paymentMethod: {
//             type: String,
//             enum: ["COD", "ONLINE"],
//             default: "COD",
//             required: true,
//         },
//         paymentStatus: {
//             type: String,
//             enum: ["PENDING", "PAID", "FAILED"],
//             default: "PENDING",
//         },
//         address: {
//             type: ObjectId,
//             ref: "customerAddress",
//             required: true,
//             index: true, // For efficient lookups
//         },
//         status: {
//             type: String,
//             enum: [
//                 "PENDING",
//                 "APPROVED",
//                 "IN_PRODUCTION",
//                 "SHIPPED",
//                 "DELIVERED",
//                 "CANCELLED",
//             ],
//             default: "PENDING",
//             index: true,
//         },
//         activities: [
//             {
//                 status: {
//                     type: String,
//                     enum: [
//                         "PENDING",
//                         "APPROVED",
//                         "IN_PRODUCTION",
//                         "SHIPPED",
//                         "DELIVERED",
//                         "CANCELLED",
//                     ],
//                     required: true,
//                 },
//                 timestamp: {
//                     type: Date,
//                     default: Date.now,
//                     required: true,
//                 },
//                 updatedBy: {
//                     type: ObjectId,
//                     ref: "clientUsers",
//                     required: true,
//                 },
//                 notes: {
//                     type: String, // e.g., "Cancelled due to stock unavailability"
//                 },
//             },
//         ],
//         createdBy: {
//             type: ObjectId,
//             ref: "clientUsers",
//             required: true,
//             index: true,
//         },
//         deletedAt: {
//             type: Date,
//             default: null,
//             index: true,
//         },
//     },
//     { timestamps: true }
// );

// // Pre-save hook to calculate subtotals and total amount
// orderSchema.pre("save", function (next) {
//     this.items.forEach((item) => {
//         item.subtotal = item.quantity * item.priceOption.price;
//     });
//     this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
//     next();
// });

// // Generate unique order number
// orderSchema.pre("save", async function (next) {
//     if (!this.orderNumber) {
//         const date = new Date().toISOString().slice(0, 10).replace(/-/, "");
//         const count = await mongoose.model("Order").countDocuments({
//             createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
//         });
//         this.orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`;
//     }
//     next();
// });

// module.exports = orderSchema;




const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema(
  {
    customer: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    orderNumber: { type: String, unique: true, required: true, index: true }, // Uncommented
    items: [
      {
        productStock: { type: ObjectId, ref: "productStock", required: true },
        productMainStock: { type: ObjectId, ref: "productMainStock", required: true },
        quantity: { type: Number, required: true, min: [1, "Quantity must be at least 1"] },
        priceOption: {
          quantity: { type: Number, required: true },
          unitPrice: { type: Number, required: true },
          price: { type: Number, required: true },
        },
        customizationDetails: {
          type: Map,
          of: Schema.Types.Mixed,
          default: new Map(),
        },
        customizationFiles: [
          {
            fieldName: { type: String, required: true },
            fileUrl: { type: String, required: true },
            originalName: { type: String },
            mimeType: { type: String },
            size: { type: Number },
          },
        ],
        subtotal: { type: Number, required: true, default: 0 },
        status: {
          type: String,
          enum: ["PENDING", "APPROVED", "DISAPPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"],
          default: "PENDING", 
          index: true,
        },
        activities: [
          {
            status: {
              type: String,
              enum: ["PENDING", "APPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"],
              required: true,
            },
            timestamp: { type: Date, default: Date.now, required: true },
            updatedBy: { type: ObjectId, ref: "clientUsers", required: true },
            notes: { type: String },
          },
        ],
      },
    ],
    totalAmount: { type: Number, required: true, default: 0 },
    paymentMethod: { type: String, enum: ["COD", "ONLINE"], default: "COD", required: true },
    paymentStatus: { type: String, enum: ["PENDING", "PAID", "FAILED"], default: "PENDING" },
    address: { type: ObjectId, ref: "customerAddress", required: true, index: true },
    // status: {
    //   type: String,
    //   enum: ["PENDING", "APPROVED", "DISAPPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"],
    //   default: "PENDING",
    //   index: true,
    // },
    // activities: [
    //   {
    //     status: {
    //       type: String,
    //       enum: ["PENDING", "APPROVED", "IN_PRODUCTION", "SHIPPED", "DELIVERED", "CANCELLED"],
    //       required: true,
    //     },
    //     timestamp: { type: Date, default: Date.now, required: true },
    //     updatedBy: { type: ObjectId, ref: "clientUsers", required: true },
    //     notes: { type: String },
    //   },
    // ],
    createdBy: { type: ObjectId, ref: "clientUsers", required: true, index: true },
    deletedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Pre-save hook to calculate subtotals and total amount
orderSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.priceOption.price;
  });
  this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  next();
});

// Generate unique order number using the current model's connection
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date().toISOString().slice(0, 10).replace(/-/, ""); // e.g., "20250411"
    // Use this.model("Order") to reference the client-specific model
    const OrderModel = this.model("Order");
    const count = await OrderModel.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) },
    }).session(this.session || null); // Use session if available
    this.orderNumber = `ORD-${date}-${String(count + 1).padStart(3, "0")}`; // e.g., "ORD-20250411-001"
  }
  next();
});

module.exports = orderSchema;