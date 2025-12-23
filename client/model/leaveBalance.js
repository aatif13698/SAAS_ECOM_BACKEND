const mongoose = require("mongoose"); 

const { Schema } = mongoose; 
const ObjectId = Schema.ObjectId; 

const leaveBalanceSchema = new Schema( 
    { 
        employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true }, 

        leaveCategories: [ 
            { 
                id: { 
                    type: ObjectId, 
                    ref: "leaveCategory", 
                    required: true, 
                }, 
                allocated: { type: Number, default: 0 }, 
                taken: { type: Number, default: 0 }, 
            } 
        ], 

        year: { type: Number, required: true }, // 2025, 2026 
        openingBalance: { type: Number, default: 0 }, 
        entitled: { type: Number, default: 0 },        // Allocated this year 
        taken: { type: Number, default: 0 }, 
        encashed: { type: Number, default: 0 }, 
        lapsed: { type: Number, default: 0 },           // At year end if not carried forward 
        closingBalance: { type: Number, default: 0 },  // Auto-calculated 
        carriedForwardFromPreviousYear: { type: Number, default: 0 }, 

        createdBy: { type: ObjectId, ref: "clientUsers", index: true }, 
        updatedBy: { type: ObjectId, ref: 'clientUsers' }, 
        updatedAt: { type: Date, default: null, index: true }, 
        deletedAt: { type: Date, default: null, index: true }, 
    }, 
    { timestamps: true } 
); 

module.exports = leaveBalanceSchema; 