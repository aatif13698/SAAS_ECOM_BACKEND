const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.ObjectId;

const saleInvoiceAndPaymentConnectionSchema = new Schema(
    {

        paymentIn: { type: ObjectId, ref: "payementIn", required: true, index: true },
        invoices: [
            {
                id: { type: ObjectId, ref: 'SaleInvoice', required: true },
                settlementAmount: {type: Number, required: true}
            }
        ],

        deletedAt: { type: Date, default: null, index: true },
    },
    { timestamps: true }
);

module.exports = saleInvoiceAndPaymentConnectionSchema;  