

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productMainStockSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'productVariant', required: true },
        varianValue: {},

        name: { type: String, default: null },
        description: { type: String, default: null },
        priceOptions: {},
        specification: [{
            title: { type: String },
            items: [{ name: { type: String }, description: { type: String } }]
        }],

        paymentOPtions: {
            cod: { type: Boolean, default: false },
            fullPayment: { type: Boolean, default: false },
            multiStep: { type: Boolean, default: false },
            wallet: { type: Boolean, default: false },
            bnpl: { type: Boolean, default: false },
            upi: { type: Boolean, default: false },
            paymentSteps: [{
                name: { type: String },
                percentage: { type: Number },
            }]
        },

        images: [{ type: String }],
        defaultImage: { type: String, default: null },
        openingStock: { type: Number, default: 0 },
        totalStock: { type: Number, default: 0 },
        onlineStock: { type: Number, required: true },
        offlineStock: { type: Number, required: true },
        lowStockThreshold: { type: Number, default: 10 },
        restockQuantity: { type: Number },
        lastRestockedAt: { type: Date },
        isBulkType: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },

        averageRating: { type: Number, default: 0 },
        reviewCount: { type: Number, default: 0 },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productMainStockSchema;





