const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetBranchSchema = new Schema(
    {


        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branchHead: { type: ObjectId, ref: "clientUsers", default: null, index: true },

        name: { type: String, required: true },
        icon: { type: String, default: null },
        iconKey: { type: String, default: null },

        gstInNumber: { type: String, required: true },
        gstInDocument: { type: String, default: null },
        gstInDocumentKey: { type: String, default: null },

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
            validate: {
                validator: function (v) {
                    return /^\+?[1-9]\d{1,14}$/.test(v);
                },
                message: 'Invalid phone number format.',
            },
        },

        houseOrFlat: { type: String, trim: true },
        streetOrLocality: { type: String, trim: true },
        landmark: { type: String, trim: true },

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

        isActive: { type: Boolean, default: false },

        // handlign created by
        createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships

        deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
    },

    { timestamps: true }
);

module.exports = clinetBranchSchema;
