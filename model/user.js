const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const userSchema = new Schema(
  {
    role: { type: ObjectId, ref: "role", index: true }, // Index for role-based queries
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


    panNumber: {
      type: String,
      trim: true,
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

   

    address: {
      type: String,
      trim: true,
    },
    pinCode: {
      type: String,
      trim: true,
    },

    profileImage: { type: String, default: null },
    profileCreated: { type: Boolean, default: false },

    verificationOtp: { type: String },
    otpGeneratedAt: { type: Date },
    OTP: { type: String },



    companyType: {
      type: String,
      enum: ["soleProprietorship",
        "partnership",
        "privateLimited",
        "limitedLiabilityCompany",
        "onePersonCompany",
        "publicLimited"
      ],
      default: null,
      trim: true,
    },

    tradeLicense: { type: String, default: null },

    signupType: {
      type: String,
      enum:  ['0', '1', '2', '3'], //0=Normal, 1=Google, 2=Facebook, 3=Twitter
      default: "0",
      trim: true,
    },


    // handling client creation

    createdBy: { type: ObjectId, ref: "user", index: true }, // Index for admin/user relationships
    isCreatedBySuperAdmin: { type: Boolean, default: false, index: true },

    accessUnit :  [{ id : {type : String} }],

    // clinet staff handling
    accessUnit: [{ id: { type: String } }],

    deletedAt: { type: Date, default: null, index: true }, // Index for soft-delete functionality
  },
  { timestamps: true }
);

// Instance method for password verification
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Creating the model
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
