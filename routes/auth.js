const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Seller = require('../models/Seller');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// --- CUSTOMER ROUTES ---

// Customer Registration
router.post('/customer/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    // Check if user already exists
    let customer = await Customer.findOne({ email });
    if (customer) return res.status(400).json({ msg: 'Customer already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save new customer
    customer = new Customer({ fullName, email, phoneNumber, password: hashedPassword });
    await customer.save();

    res.status(201).json({ msg: 'Customer registered successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Customer Login
router.post('/customer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Generate token
    const token = jwt.sign({ id: customer._id, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });
    
    res.json({ token, user: { id: customer._id, fullName: customer.fullName, email: customer.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// --- SELLER ROUTES ---

// Seller Registration (Simplified without file upload logic for now)
router.post('/seller/register', async (req, res) => {
    try {
      const { fullName, email, phoneNumber, shopName, password, idProofType } = req.body;
  
      let seller = await Seller.findOne({ email });
      if (seller) return res.status(400).json({ msg: 'Seller already exists' });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      seller = new Seller({ fullName, email, phoneNumber, shopName, password: hashedPassword, idProofType });
      await seller.save();
  
      res.status(201).json({ msg: 'Seller registered successfully. Pending approval.' });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });

// Seller Login
router.post('/seller/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const seller = await Seller.findOne({ email });
      if (!seller) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const isMatch = await bcrypt.compare(password, seller.password);
      if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
  
      const token = jwt.sign({ id: seller._id, role: 'seller' }, JWT_SECRET, { expiresIn: '1h' });
      
      res.json({ token, user: { id: seller._id, shopName: seller.shopName, email: seller.email } });
    } catch (err) {
      res.status(500).json({ msg: 'Server error' });
    }
  });

module.exports = router;