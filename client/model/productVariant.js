

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productVariantSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        variant: {},
        stockEffect: {},
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productVariantSchema;





