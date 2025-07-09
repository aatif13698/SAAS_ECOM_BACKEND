

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const attributesSchema = new Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        attributes: [
            {
                name: {
                    type: String,  trim: true, 
                },
                description: { type: String, required: true },
                values: {
                    type: [
                        { valueName: { type: String } }
                    ]
                },
            }
        ],

        isActive: { type: Boolean, default: true },

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = attributesSchema;





