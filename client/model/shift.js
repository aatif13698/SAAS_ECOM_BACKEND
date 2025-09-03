

const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const clientShiftSchema = new Schema(
    {
        businessUnit: { type: ObjectId, ref: "businessUnit", default: null, index: true },
        branch: { type: ObjectId, ref: "branch", default: null, index: true },
        warehouse: { type: ObjectId, ref: "warehouse", default: null, index: true },

        isVendorLevel: { type: Boolean, default: false },
        isBuLevel: { type: Boolean, default: false },
        isBranchLevel: { type: Boolean, default: false },
        isWarehouseLevel: { type: Boolean, default: false },

        shiftName: { type: String, required: true },
        startTime: { type: Date, required: true },
        endTime: { type: Date, required: true },
        duration: { type: Number }, 
        shiftType: { type: String, enum: ['day', 'night', 'rotating', 'on-call'], required: true },
        status: { type: String, enum: ['planned', 'active', 'completed', 'canceled'], default: 'planned' },
        assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers' }],
        requiredEmployees: { type: Number, default: 1 },
        notes: { type: String, default: null },
        recurring: {
            frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
            days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }]
        },
        isActive: { type: Boolean, default: false },
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },
        updatedBy: { type: ObjectId, ref: 'clientUsers' },
        updatedAt: { type: Date, default: null, index: true },
        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

// Virtual for duration
clientShiftSchema.virtual('duration').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60); // minutes
});

module.exports = clientShiftSchema;





