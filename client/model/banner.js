const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const bannerSchema = new Schema(
    {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductBlueprint', required: true },
        image: { type: String, default: null },
        iconKey: { type: String, default: null },
        order: { type: Number },
        published: { type: Boolean, default: false },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = bannerSchema;  