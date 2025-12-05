const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clinetUserSchema = new Schema(
    {
        role: { type: ObjectId, ref: "clientRoles", index: true }, // Index for role-based queries
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        workingDepartment: { type: ObjectId, ref: "clientWorkingDepartment", default: null, index: true },
        shift: { type: ObjectId, ref: "clientShift", default: null, index: true },

        roleId: { type: Number },
        firstName: { type: String, required: true },
        lastName: { type: String },

        email: {
            type: String, unique: true, lowecase: true,
            trim: true, sparse: true, index: true
        },
        phone: { type: String, unique: true, sparse: true, trim: true, index: true },

        password: { type: String, required: true },
        tc: { type: Boolean, required: true },

        isUserVerified: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true },

        // fields for profile
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
            default: 'Prefer not to say',
            trim: true,
        },


        dateOfBirth: {
            type: Date,
            validate: {
                validator: function (v) {
                    return v && v instanceof Date && !isNaN(v);
                },
                message: 'Invalid Date of Birth.',
            },
        },

        optionalEmail: {
            type: String,
            lowercase: true,
            trim: true,
            sparse: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
                },
                message: 'Invalid email format.',
            },
        },

        emergencyPhone: {
            type: String,
            trim: true,
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

        profileImage: { type: String, default: null },
        iconKey: { type: String, default: null },
        profileCreated: { type: Boolean, default: false },

        verificationOtp: { type: String },
        otpGeneratedAt: { type: Date },
        OTP: { type: String },


        // business informations
        isBusinessAccount:{ type: Boolean, default: false },
        businessName: { type: String },
        tanNumber: { type: String },
        licenseNumber: { type: String },
        gstin: { type: String },
        businessAddress: { type: String },


        // handlign created by
        createdBy: { type: ObjectId, ref: "clientUsers", index: true }, // Index for admin/user relationships
        deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
    },

    { timestamps: true }
);

// Instance method for password verification
clinetUserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};


module.exports = clinetUserSchema;
