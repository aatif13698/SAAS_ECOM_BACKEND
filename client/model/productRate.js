

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productRateSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'productVariant', required: true },
        price: [{
            quantity: {type: Number},
            unitPrice: {type: Number},
            hasDiscount: {type: Boolean, default: false},
            discountPercent: {type: Number, default: 0},
            isCustomerSpecific: {type: Boolean, default: false},
            customerId: { type: ObjectId, ref: "clientUsers", default: null },
        }],
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productRateSchema;





