const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  fromCurrency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: true },
  toCurrency: { type: mongoose.Schema.Types.ObjectId, ref: 'Currency', required: true },
  rate: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true } // Historical rate date
});

// Index for quick lookups
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, date: -1 });

// Static to get rate for date (latest if not exact)
exchangeRateSchema.statics.getRate = async function(fromId, toId, date) {
  const rateDoc = await this.findOne({
    fromCurrency: fromId,
    toCurrency: toId,
    date: { $lte: date }
  }).sort({ date: -1 });
  return rateDoc ? rateDoc.rate : null;
};

module.exports = exchangeRateSchema;
