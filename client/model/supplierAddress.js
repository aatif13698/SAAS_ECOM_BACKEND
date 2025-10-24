const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const supplierAddressSchema = new Schema(
    {
        customerId: { type: ObjectId, ref: "supplier", index: true },
        fullName: { type: String, required: true },
        phone: { type: String, sparse: true, trim: true, index: true },
        alternamtivePhone: { type: String, sparse: true, trim: true, index: true },
        country: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        ZipCode: {
            type: String,
            trim: true,
        },
        houseNumber: {
            type: String,
            trim: true,
        },
        roadName: {
            type: String,
            trim: true,
        },
        nearbyLandmark: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        isDefault: {type: Boolean, default: false},
        deletedAt: { type: Date, default: null, index: true }, 
    },
    { timestamps: true }
);




module.exports = supplierAddressSchema;
