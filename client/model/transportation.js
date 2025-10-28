

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const supplierTransportationSchema = new Schema(
    {
        supplierId: {
            type: ObjectId,
            ref: "supplier",
            required: true,
            index: true,
        },

        transporterName: { type: String, default: null },
        transporterGstin: { type: String, default: null },
        transporterPan: { type: String, default: null },
        transporterAddress: { type: String, default: null },
        transporterContactPerson: { type: String, default: null },
        transporterPhone: { type: String, default: null },
        transporterEmail: { type: String, default: null },
        transporterId: { type: String, default: null }, // optional govt ID

        isDefault: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        createdBy: { type: ObjectId, ref: "clientUsers", default: null, index: true }, // Index for admin/user relationships
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = supplierTransportationSchema;
