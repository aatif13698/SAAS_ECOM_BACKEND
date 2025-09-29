const mongoose = require('mongoose');

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, trim: true, match: /^[A-Z]{3}$/ }, // ISO 4217, e.g., 'INR'
  name: { type: String, required: true, trim: true }, // e.g., 'INDIAN Rupee'
  decimalName: { type: String, required: true }, 
  decimaNumber: { type: Number, required: true }, 
  symbol: { type: String, required: true , trim: true}, // e.g., '₹'
  isBase: { type: Boolean, default: false },
  isActive: { type: Boolean, default: false },
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

currencySchema.pre('save', async function(next) {
  if (this.isActive) {
    const existingActive = await this.constructor.findOne({ isActive: true, _id: { $ne: this._id } });
    if (existingActive) {
      return next(new Error('Only one currency should be activated.'));
    }
  }
  next();
});



module.exports = currencySchema;

