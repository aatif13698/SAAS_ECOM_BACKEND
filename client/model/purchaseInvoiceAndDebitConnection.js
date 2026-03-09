const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const purchaseInvoiceAndDebitConnectionSchema = new Schema(
    {

        debitNote: { type: ObjectId, ref: "debitNote", required: true, index: true },
        invoices: [
            {
                id: { type: ObjectId, ref: 'purchaseInvoice', required: true },
                settlementAmount: {type: Number, required: true}
            }
        ],

        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = purchaseInvoiceAndDebitConnectionSchema;  