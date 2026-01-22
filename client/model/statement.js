const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId;

const statementSchema = new mongoose.Schema({
    title: { type: String, default: null },
    description: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    type: { type: String, enum: ["Primacy", 'Refund', 'Terms'], required: true }, // Enum for validation
    deletedAt: {
        type: Date,
        default: null,
    },
    createdBy: { type: ObjectId, ref: "clientUsers", index: true },
}, { timestamps: true });

module.exports = statementSchema;