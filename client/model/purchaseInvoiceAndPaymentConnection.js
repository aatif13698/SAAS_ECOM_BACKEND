const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const purchaseInvoiceAndPaymentConnectionSchema = new Schema(
    {

        paymentOut: { type: ObjectId, ref: "payementOut", required: true, index: true },
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

module.exports = purchaseInvoiceAndPaymentConnectionSchema;  