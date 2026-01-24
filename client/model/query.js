const mongoose = require("mongoose");  

const { Schema } = mongoose;  
const ObjectId = Schema.ObjectId;  

const querySchema = new Schema(  
    {  
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'clientUsers', required: true },  
        isPredefined: { type: Boolean, default: false },  
        question: { type: String, default: null },  
        answer: { type: String, default: null },  
        hasAnswered: { type: Boolean, default: false },  
        createdBy: { type: ObjectId, ref: "clientUsers", index: true },  
        deletedAt: { type: Date, default: null, index: true },  
        updatedAt: { type: Date, default: null, index: true },  
    },  
    { timestamps: true }  
);  

module.exports = querySchema;  