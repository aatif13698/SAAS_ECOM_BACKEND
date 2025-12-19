const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const overTimeSchema = new Schema(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true },
        attendanceId: { type: Schema.Types.ObjectId, ref: 'attendance' }, // Link to daily attendance

        date: { type: Date, required: true }, // Overtime date
        requestedMinutes: { type: Number, required: true }, // How many minutes employee claims
        approvedMinutes: { type: Number, default: 0 },

        type: {
            type: String,
            enum: ['normal', 'weekend', 'holiday'],
            required: true
        },

        reason: { type: String, required: true }, // "Project deadline", "Support call", etc.

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'auto_approved'],
            default: 'pending'
        },

        approvedBy: { type: Schema.Types.ObjectId, ref: 'clientUsers' },
        approvedAt: { type: Date },
        rejectionReason: String,

        remarks: { type: String },

        eatedBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },

    },
    { timestamps: true }
);

module.exports = overTimeSchema; 