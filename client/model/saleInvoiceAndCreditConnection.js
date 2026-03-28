const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const saleInvoiceAndCrditConnectionSchema = new Schema(
    {

        creditNote: { type: ObjectId, ref: "creditNote", required: true, index: true },
        invoices: [
            {
                id: { type: ObjectId, ref: 'saleInvoice', required: true },
                settlementAmount: {type: Number, required: true}
            }
        ],

        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = saleInvoiceAndCrditConnectionSchema;  