const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, match: /^[A-Z]{3}$/ }, // ISO 4217, e.g., 'USD'
  name: { type: String, required: true }, // e.g., 'US Dollar'
  symbol: { type: String, required: true }, // e.g., '$'
  isBase: { type: Boolean, default: false }
});

// Ensure only one base currency
currencySchema.pre('save', async function(next) {
  if (this.isBase) {
    const existingBase = await this.constructor.findOne({ isBase: true, _id: { $ne: this._id } });
    if (existingBase) {
      return next(new Error('Only one base currency allowed'));
    }
  }
  next();
});


module.exports = currencySchema;

