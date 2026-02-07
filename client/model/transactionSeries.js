const mongoose = require("mongoose");

const transactionSerialNumebrSchema = mongoose.Schema({
    collectionName: { type: String },
    year: {type: String, required: true },
    prefix: { type: String },
    nextNum: { type: Number, default: 10001 }
})


module.exports = transactionSerialNumebrSchema;

