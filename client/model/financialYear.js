const mongoose = require('mongoose');

const financialYearSchema = new mongoose.Schema({
  name: { type: String, require: true},
  alias: { type: String, require: true, unique: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  isClosed: { type: Boolean, default: false },
  closingDate: { type: Date },
  notes: { type: String }
});


module.exports = financialYearSchema;



// // Validate endDate > startDate
// financialYearSchema.pre('save', function(next) {
//   if (this.endDate <= this.startDate) {
//     return next(new Error('End date must be after start date'));
//   }
//   next();
// });

// // Static method to get current FY based on date
// financialYearSchema.statics.getFYForDate = async function(date) {
//   return this.findOne({ startDate: { $lte: date }, endDate: { $gte: date } });
// };

// // Static method for year-end closing (simplified; extend with full logic)
// financialYearSchema.methods.closeFY = async function() {
//   if (this.isClosed) return;
  
//   const Voucher = require('./Voucher');
//   const Ledger = require('./Ledger');
  
//   // Example: Aggregate P&L for this FY
//   const plAggregation = await Voucher.aggregate([
//     { $match: { date: { $gte: this.startDate, $lte: this.endDate } } },
//     { $unwind: '$entries' },
//     { $lookup: { from: 'ledgers', localField: 'entries.ledger', foreignField: '_id', as: 'ledger' } },
//     { $unwind: '$ledger' },
//     { $match: { 'ledger.group.name': { $in: ['Direct Incomes', 'Indirect Incomes', 'Direct Expenses', 'Indirect Expenses'] } } },
//     { $group: { _id: null, totalIncome: { $sum: '$entries.credit' }, totalExpense: { $sum: '$entries.debit' } } }
//   ]);

//   const netProfit = (plAggregation[0]?.totalIncome || 0) - (plAggregation[0]?.totalExpense || 0);
  
//   // Transfer to Reserves (assume Reserves ledger exists)
//   const reservesLedger = await Ledger.findOne({ name: 'General Reserve A/c' });
//   if (netProfit !== 0) {
//     // Create journal voucher for profit transfer (simplified)
//     const journal = new Voucher({
//       type: 'Journal',
//       date: this.endDate,
//       narration: `Year-end profit transfer for FY ${this.startDate.getFullYear()}-${this.endDate.getFullYear()}`,
//       entries: [
//         { ledger: reservesLedger._id, credit: netProfit > 0 ? netProfit : 0, debit: netProfit < 0 ? Math.abs(netProfit) : 0 },
//         // Opposite entry to P&L summary ledger (assume exists)
//       ]
//     });
//     await journal.save();
//   }

//   // Update opening balances for next FY (create new FY if needed)
//   const nextStart = new Date(this.endDate);
//   nextStart.setDate(nextStart.getDate() + 1);
//   const nextEnd = new Date(nextStart);
//   nextEnd.setFullYear(nextEnd.getFullYear() + 1);
//   nextEnd.setDate(nextEnd.getDate() - 1);
//   let nextFY = await this.constructor.findOne({ startDate: nextStart });
//   if (!nextFY) {
//     nextFY = new this.constructor({ startDate: nextStart, endDate: nextEnd });
//     await nextFY.save();
//   }

//   // Carry forward balances (simplified: update all ledgers' openingBalance for next FY)
//   const ledgers = await Ledger.find();
//   for (const ledger of ledgers) {
//     ledger.openingBalance = ledger.balance; // Closing of current = opening of next
//     ledger.openingDate = nextStart;
//     await ledger.save();
//   }

//   this.isClosed = true;
//   this.closingDate = new Date();
//   await this.save();
// };

// module.exports = mongoose.model('FinancialYear', financialYearSchema);