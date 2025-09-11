const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetBusinessUnitSchema = new Schema(
    {


        buHead: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships

        name: { type: String, required: true },
        icon :{ type: String, default : null },
        iconKey: { type: String, default : null },
        tinNumber :{ type: String, default : null },
        businessLicenseNumber :{ type: String, default : null },
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

        isActive: { type: Boolean, default: true },

        // handlign created by
        createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships

        deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
    },

    { timestamps: true }
);

module.exports = clinetBusinessUnitSchema;
