


const mongoose = require("mongoose");
const { Schema } = mongoose;
const clinetCategorySchema = new Schema(
  {
    name: {
      type: String, unique: true, lowecase: true,
      trim: true, sparse: true, index: true
    }, 
    description: { type: String, required: true },
    slug: { type: String,  required: true, sparse: true, trim: true, index: true }, 
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: null },
    isCreatedBySuperAdmin: { type: Boolean, default: true ,  index: true},
    deletedAt: { type: Date, default: null, index: true }, 
    updatedAt: { type: Date, default: null, index: true }, 
  },
  { timestamps: true }
);

module.exports = clinetCategorySchema;




