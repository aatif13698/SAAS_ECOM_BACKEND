const mongoose = require("mongoose");
const { Schema } = mongoose;

const ledgerCustomDataSchema = new mongoose.Schema(
  {
    otherThanFiles: {
      type: Map,
      of: Schema.Types.Mixed,
      default: new Map(),
    },
    files: [
      {
        fieldName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number },
        key: { type: String }
      },
    ],
    ledgerId: { type: mongoose.Schema.Types.ObjectId, ref: "ledger", default: null, index: true },
  },
  { timestamps: true }
);

module.exports = ledgerCustomDataSchema;