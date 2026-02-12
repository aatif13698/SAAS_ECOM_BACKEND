const mongoose = require("mongoose");

const transactionSerialNumebrSchema = mongoose.Schema({
    collectionName: { type: String },
    year: { type: String, required: true },
    prefix: {
        type: String, required: true,
        trim: true, unique: true
    },
    nextNum: { type: Number, default: 10001 }
})


module.exports = transactionSerialNumebrSchema;

