

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productStockSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true }, 
        businessUnit: { type: ObjectId, ref: "businessUnit", default:null, index: true }, 
        branch: { type: ObjectId, ref: "branch", default:null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default:null, index: true },
        totalStock: { type: Number, required: true }, 
        priceOptions: [
            {
                quantity: { type: Number, required: true },
                unit: { type: String, required: true },
                price: { type: Number, required: true }
            },
        ],
        onlineStock: { type: Number, required: true }, 
        offlineStock: { type: Number, required: true }, 
        lowStockThreshold: { type: Number, default: 10 }, 
        restockQuantity: { type: Number }, 
        lastRestockedAt: { type: Date }, 
        isActive: { type: Boolean, default: true },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productStockSchema;





