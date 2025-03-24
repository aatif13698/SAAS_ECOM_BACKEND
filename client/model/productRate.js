

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productRateSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        priceOptions: [
            {
                quantity: { type: Number, required: true },
                unit: { type: String, required: true },
                price: { type: Number, required: true }
            },
        ],
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productRateSchema;





