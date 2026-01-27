const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

const statementSchema = new mongoose.Schema({
    type: { type: String, enum: ["Privacy", 'Refund', 'Terms', 'About'], required: true }, // Enum for validation
    title: { type: String, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    deletedAt: {
        type: Date,
        default: null,
    },
    images: [{ type: String }],
    createdBy: { type: ObjectId, ref: "clientUsers", index: true },
}, { timestamps: true });

module.exports = statementSchema;