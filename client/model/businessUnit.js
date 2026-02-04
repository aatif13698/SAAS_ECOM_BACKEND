const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetBusinessUnitSchema = new Schema(
    {


        buHead: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships

        name: { type: String, required: true },
        icon: { type: String, default: null },
        iconKey: { type: String, default: null },

        // business details
        tinNumber: { type: String, default: null },
        cinNumber: { type: String, default: null },
        tanNumber: { type: String, default: null },
        panNumber: { type: String, required: true },
        businessLicenseNumber: { type: String, default: null },

        tinDocument: { type: String, default: null },
        tinDocumentKey: { type: String, default: null },
        cinDocument: { type: String, default: null },
        cinDocumentKey: { type: String, default: null },
        tanDocument: { type: String, default: null },
        tanDocumentKey: { type: String, default: null },
        panDocument: { type: String, default: null },
        panDocumentKey: { type: String, default: null },
        businessLicenseDocument: { type: String, default: null },
        businessLicenseDocumentKey: { type: String, default: null },


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

        houseOrFlat: { type: String, trim: true },

        streetOrLocality: { type: String, trim: true },
        landmark: { type: String, trim: true },
        city: { type: String, trim: true },

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

        lat: { type: Number, default: 28.613939 },
        lng: { type: Number, default: 77.209021 },
        radiusInMeter: { type: Number, default: 100 },

        isActive: { type: Boolean, default: true },

        // handlign created by
        createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships

        deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
    },

    { timestamps: true }
);

module.exports = clinetBusinessUnitSchema;
