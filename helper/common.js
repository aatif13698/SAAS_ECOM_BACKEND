const crypto = require('crypto');

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString(); // Generates a 6-digit OTP as a string
}


function convertPricingTiers(pricingArray) {
    return pricingArray.map((item, index, arr) => ({
      minQuantity: item.quantity,
      maxQuantity: index < arr.length - 1 ? arr[index + 1].quantity - 1 : null,
      unitPrice: item.unitPrice
    }));
  };




module.exports = {
    generateOtp,
    convertPricingTiers
};