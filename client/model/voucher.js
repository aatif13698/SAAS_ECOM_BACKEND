const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema({
  voucherLinkId: {type: String, require: true},
  voucherGroup: { type: mongoose.Schema.Types.ObjectId, ref: 'voucherGroup', require: true },
  date: { type: Date, default: Date.now, required: true },
  narration: { type: String },
  ledger: { type: mongoose.Schema.Types.ObjectId, ref: 'ledger', required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  currency: { type: mongoose.Schema.Types.ObjectId, ref: 'currency', default: null },
  amountForeign: { type: Number, default: 0 },
  exchangeRate: { type: Number, default: 1 },
  financialYear: { type: mongoose.Schema.Types.ObjectId, ref: 'financialYear', required: true },
  //   relatedInvoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null }, // Optional: Link to invoice
  isSingleEntry: { type: Boolean, default: false },// Not used for standard accounting
  createdBy: { type: ObjectId, ref: "clientUsers", index: true },
});

// Pre-save: Validate double-entry and assign FY
voucherSchema.pre('save', async function (next) {
  const totalDebit = this.entries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = this.entries.reduce((sum, entry) => sum + entry.credit, 0);
  if (Math.abs(totalDebit - totalCredit) > 0.01) { // Allow small float errors
    return next(new Error('Debit and credit amounts must balance'));
  }
  next();
});

// Post-save: Update ledger balances
// voucherSchema.post('save', async function() {
//   const Ledger = require('./Ledger');
//   for (const entry of this.entries) {
//     const ledger = await Ledger.findById(entry.ledger);
//     ledger.balance += (entry.credit - entry.debit); // Credit increases liability/equity, debit increases assets
//     if (this.currency && ledger.currency) {
//       ledger.balanceForeign += (entry.credit - entry.debit) / this.exchangeRate;
//     }
//     await ledger.save();
//   }
// });

module.exports = voucherSchema;
