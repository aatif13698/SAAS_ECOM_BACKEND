

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetBrandSchema = new Schema(
  {
    name: {
      type: String, unique: true, lowecase: true,
      trim: true, sparse: true, index: true
    }, 
    description: { type: String, required: true },
    slug: { type: String,  required: true, sparse: true, trim: true, index: true }, 
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: null },
    createdBy: { type: ObjectId, ref: "clientUsers", index: true }, 
    deletedAt: { type: Date, default: null, index: true }, 
    updatedAt: { type: Date, default: null, index: true }, 
  },
  { timestamps: true }
);

module.exports = clinetBrandSchema;





