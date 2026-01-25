const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const sectionSchema = new Schema(
    {
        template: { type: String, required: true },
        type: { type: String, enum: ['card', 'carousel', 'grid'], required: true },
        title: { type: String, required: true },
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true }],
        order: { type: Number },
        published: { type: Boolean, default: false },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = sectionSchema;  