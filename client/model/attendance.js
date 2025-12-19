const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const attendanceSchema = new Schema(
    {
        employeeId: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true },
        date: { type: Date, required: true }, // Date only (midnight)

        punchIn: { type: Date },
        punchOut: { type: Date },

        // Calculated fields
        totalWorkedMinutes: { type: Number, default: 0 }, // punchOut - punchIn (excluding breaks if any)
        expectedMinutes: { type: Number, default: 480 },

        lateInMinutes: { type: Number, default: 0 },
        earlyOutMinutes: { type: Number, default: 0 },

        overtimeMinutes: { type: Number, default: 0 }, // Auto-calculated daily overtime
        overtimeType: {
            type: String,
            enum: ['none', 'normal', 'weekend', 'holiday'],
            default: 'none'
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'half_day', 'holiday', 'weekend', 'on_leave'],
            default: 'present'
        },
        notes: String,

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },

    },
    { timestamps: true }
);

module.exports = attendanceSchema; 