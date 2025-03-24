const crypto = require('crypto');

function generateOtp() {
  return crypto.randomInt(100000, 1000000).toString(); // Generates a 6-digit OTP as a string
}



module.exports = {
    generateOtp,
};