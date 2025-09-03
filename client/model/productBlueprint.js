

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const productBlueprintSchema = new Schema(
    {
        categoryId: { type: ObjectId, ref: "clientCategory", index: true },
        subCategoryId: { type: ObjectId, ref: "clientSubCategory", index: true },
        name: { type: String, unique: true, required: true },
        description: { type: String },
        brandId: { type: ObjectId, ref: 'brand' },
        manufacturerId: { type: ObjectId, ref: 'manufacturer' },
        // attributeId: { type: ObjectId, ref: 'attribute' }, 
        images: [{ type: String }],
        taxRate: { type: Number, default: 0 },
        sku: { type: String, unique: true },
        isCustomizable: { type: Boolean, default: false },
        customizableOptions: [
            {
                selectedField: { type: String },
                labelName: { type: String, default: null },
                selectOptions: [{
                    valueName: { type: String }
                }],
                validation: {
                    fileTypes: [{ type: String }],
                    maxSize: Number
                },
            },
        ],

        // customizableOptions : [{type : Object}],
        additionalPrice: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
        updatedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = productBlueprintSchema;





