

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetManufacturerSchema = new Schema(
  {
    name: {
      type: String, unique: true, lowecase: true,
      trim: true, sparse: true, index: true
    },
    email: {
      type: String, lowecase: true,
      trim: true, index: true
    },
    phone: { type: String, trim: true, index: true },
    description: { type: String, required: true },
    slug: { type: String, required: true, sparse: true, trim: true, index: true },
    url : {type :  String, default:  null},
    country : {type :  String, default:  null},
    isActive: { type: Boolean, default: true },
    icon: { type: String, default: null },
    iconKey: { type: String, default: null },
    createdBy: { type: ObjectId, ref: "clientUsers", index: true },
    deletedAt: { type: Date, default: null, index: true },
    updatedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

module.exports = clinetManufacturerSchema;





