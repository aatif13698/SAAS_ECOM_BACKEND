const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const leaveRequestsSchema = new Schema(
    {

        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true },

        leaveTypeId: {
            type: Schema.Types.ObjectId,
            ref: 'leaveCategory',
            required: true
        },

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },

        // Half-day support 
        isHalfDay: { type: Boolean, default: false },
        halfDaySession: {
            type: String,
            enum: ['first_half', 'second_half'],
            required: function () { return this.isHalfDay; }
        },

        totalDays: {
            type: Number,
            required: true
        },

        reason: { type: String, required: true },
        attachment: { type: String }, // URL to uploaded medical cert, etc. 

        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'cancelled', 'withdrawn'],
            default: 'pending'
        },

        appliedBy: { type: Schema.Types.ObjectId, ref: 'clientUsers', required: true }, // Usually same as employeeId 
        appliedAt: { type: Date },

        // Approval workflow 
        approvedBy: { type: Schema.Types.ObjectId, ref: 'clientUsers', default: null },
        approvedAt: { type: Date },
        rejectionReason: { type: String },

        // Optional: backup person or handover notes 
        handoverTo: { type: Schema.Types.ObjectId, ref: 'clientUsers', default: null },
        handoverNotes: String,

        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = leaveRequestsSchema; 