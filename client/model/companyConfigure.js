const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.ObjectId

const companyConfigureSchema = new mongoose.Schema({

    name: { type: String, trim: true, require: true },
    description: { type: String, trim: true, require: true },

    longLogo: { type: String, trim: true, require: true },
    longLogoKey: { type: String, trim: true, require: true },

    shortLogo: { type: String, trim: true, require: true },
    shortLogoKey: { type: String, trim: true, require: true },

    fullAddress: { type: String, trim: true, require: true },
    phone: { type: String, trim: true, require: true },
    email: { type: String, trim: true, require: true },

    instaLink: { type: String, default: null },
    showInsta: { type: Boolean, default: false },

    facebookLink: { type: String, default: null },
    showFacebook: { type: Boolean, default: false },

    linkedinLink: { type: String, default: null },
    showLinkedin: { type: Boolean, default: false },

    telegramLink: { type: String, default: null },
    showTelegram: { type: Boolean, default: false },


    createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true },
    deletedAt: { type: Date, default: null, index: true },
}, { timestamps: true });



module.exports = companyConfigureSchema;
