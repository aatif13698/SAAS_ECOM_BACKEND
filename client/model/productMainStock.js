

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productMainStockSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true }, 
        businessUnit: { type: ObjectId, ref: "businessUnit", default:null, index: true }, 
        branch: { type: ObjectId, ref: "branch", default:null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default:null, index: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: 'productVariant', required: true },
        varianValue: {},
        
        name:  {type: String, default: null},
        description:  {type: String, default: null},
        totalStock: { type: Number, required: true }, 
        priceOptions:{},    
        images: [{ type: String }],
        defaultImage: {type: String, default: null},
        onlineStock: { type: Number, required: true }, 
        offlineStock: { type: Number, required: true }, 
        lowStockThreshold: { type: Number, default: 10 }, 
        restockQuantity: { type: Number }, 
        lastRestockedAt: { type: Date }, 
        isBulkType: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productMainStockSchema;





