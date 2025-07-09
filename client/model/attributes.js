

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const attributesSchema = new Schema(
    {
        categoryId: { type: ObjectId, ref: "clientCategory", index: true },
        subCategoryId: { type: ObjectId, ref: "clientSubCategory", index: true },
        attributes: [
            {
                name: {
                    type: String, unique: true, trim: true, sparse: true, index: true
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





