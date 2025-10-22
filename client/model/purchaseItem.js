

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const purchaseItemsSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        productMainStockId: { type: ObjectId, ref: "productMainStock", required: true },

        totalStock: { type: Number, default: 0 },
        onlineStock: { type: Number, default: 0 },
        offlineStock: { type: Number, default: 0 },
        lowStockThreshold: { type: Number, default: 0 },
        restockQuantity: { type: Number, default: null },
        lastRestockedAt: { type: Date },
        unitCost: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = purchaseItemsSchema;





