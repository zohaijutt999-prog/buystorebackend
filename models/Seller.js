const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  shopName: { type: String, required: true },
  password: { type: String, required: true },
  idProofType: { type: String, required: true },
  // For file uploads, we typically store the file path/URL, not the file itself in the DB
  idProofFrontUrl: { type: String }, 
  idProofBackUrl: { type: String },
  isApproved: { type: Boolean, default: false }, // Good practice for sellers
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Seller', SellerSchema);