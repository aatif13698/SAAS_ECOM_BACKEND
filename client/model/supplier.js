const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const supplierSchema = new Schema(
    {
        name: { type: String, required: true },
        contactPerson: { type: String, required: true },
        emailContact: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
            trim: true,
            sparse: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: 'Invalid email format.',
            },
        },
        contactNumber: {
            type: String,
            trim: true,
            unique: true,
            validate: {
                validator: function (v) {
                    return /^\+?[1-9]\d{1,14}$/.test(v);
                },
                message: 'Invalid phone number format.',
            },
        },
        url: { type: String, default: null },
        city: {
            type: String,
            trim: true,
        },
        state: {
            type: String,
            trim: true,
        },
        country: {
            type: String,
            trim: true,
        },
        ZipCode: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        GstVanNumber: { type: String, default: null },
        isActive: { type: Boolean, default: true },

        // link items
        items: [
            {
                productStock: {
                    type: ObjectId,
                    ref: "productStock",
                    required: true,
                },
                productMainStock: {
                    type: ObjectId,
                    ref: "productMainStock",
                    required: true,
                },
            }
        ],

        // handlign created by
        createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships
        deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
    },

    { timestamps: true }
);

module.exports = supplierSchema;
