const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const subCategorySchema = new Schema(
  {
    categoryId : { type: ObjectId, ref: "category", index: true }, 
    name: {
      type: String, unique: true, lowecase: true,
      trim: true, sparse: true, index: true
    }, 
    description: { type: String, required: true },
    slug: { type: String,  required: true, sparse: true, trim: true, index: true }, 
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: null },
    createdBy: { type: ObjectId, ref: "user", index: true }, 
    isCreatedBySuperAdmin: { type: Boolean, default: true ,  index: true},
    deletedAt: { type: Date, default: null, index: true }, 
    updatedAt: { type: Date, default: null, index: true }, 
  },
  { timestamps: true }
);


const subCategoryModel = mongoose.model("SubCategory", subCategorySchema);

module.exports = subCategoryModel;
