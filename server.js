const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const app = express();

// --- FIXED CORS CONFIGURATION ---
const allowedOrigins = [
  'https://buystore.io',
  'https://www.buystore.io',
  'http://localhost:5173', // Local development (Vite) ke liye
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.use(express.json()); 

// --- SERVE UPLOADED IMAGES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MULTER CONFIGURATION ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync('uploads/')) {
      fs.mkdirSync('uploads/');
    }
    cb(null, 'uploads/') 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});
const upload = multer({ storage: storage });

// --- DATABASE CONNECTION ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',      
  password: process.env.DB_PASSWORD || '',      
  database: process.env.DB_NAME || 'weyfeir_store',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(() => console.log('✅ Connected to MySQL Database Successfully!'))
  .catch((err) => console.error('❌ MySQL Connection Error:', err));

// --- ROUTES (Same as your logic) ---

// 1. AUTHENTICATION ROUTES
app.post('/api/register/customer', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;
    const [existingUsers] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ message: 'Email already exists!' });
    await pool.execute('INSERT INTO customers (fullName, email, phoneNumber, password) VALUES (?, ?, ?, ?)', [fullName, email, phoneNumber, password]);
    res.status(201).json({ message: 'Customer registered successfully!' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/register/seller', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, shopName, password, idProofType } = req.body;
    const [existingSellers] = await pool.execute('SELECT * FROM sellers WHERE email = ?', [email]);
    if (existingSellers.length > 0) return res.status(400).json({ message: 'Email already exists!' });
    await pool.execute('INSERT INTO sellers (fullName, email, phoneNumber, shopName, password, idProofType) VALUES (?, ?, ?, ?, ?, ?)', [fullName, email, phoneNumber, shopName, password, idProofType]);
    res.status(201).json({ message: 'Seller registered successfully!' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/login/customer', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.execute('SELECT id, fullName, email, phoneNumber FROM customers WHERE email = ? AND password = ?', [email, password]);
    if (users.length > 0) res.status(200).json({ message: 'Login successful', user: users[0] });
    else res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/login/seller', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [sellers] = await pool.execute('SELECT id, fullName, email, phoneNumber, shopName FROM sellers WHERE email = ? AND password = ?', [email, password]);
    if (sellers.length > 0) res.status(200).json({ message: 'Login successful', user: sellers[0] });
    else res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// 2. PRODUCT ROUTES
app.get('/api/products/all', async (req, res) => {
  try {
    const [products] = await pool.execute(`
      SELECT p.*, s.shopName 
      FROM products p 
      JOIN sellers s ON p.seller_id = s.id 
      ORDER BY p.created_at DESC
    `);
    res.status(200).json(products);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/seller/products/:sellerId', async (req, res) => {
  try {
    const [products] = await pool.execute('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', [req.params.sellerId]);
    res.status(200).json(products);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/seller/products', upload.single('productImage'), async (req, res) => {
  try {
    const { seller_id, title, category, price, stock_qty, description, profit, existing_image_url } = req.body;
    const baseUrl = process.env.BACKEND_URL || 'https://backend.buystore.io';
    let image_url = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"; 
    
    if (req.file) {
      image_url = `${baseUrl}/uploads/${req.file.filename}`;
    } else if (existing_image_url) {
      image_url = existing_image_url;
    }

    const query = `INSERT INTO products (seller_id, title, category, price, stock_qty, description, profit, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await pool.execute(query, [seller_id, title, category, price, stock_qty, description, profit, image_url]);
    
    res.status(201).json({ message: 'Product added successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// PROFILE UPDATE ROUTES
app.put('/api/seller/profile/:id', async (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;
    await pool.execute('UPDATE sellers SET fullName = ?, phoneNumber = ?, email = ? WHERE id = ?', [fullName, phoneNumber, email, req.params.id]);
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.put('/api/seller/shop/:id', async (req, res) => {
  try {
    const { shopName, email, phoneNumber } = req.body;
    await pool.execute('UPDATE sellers SET shopName = ?, email = ?, phoneNumber = ? WHERE id = ?', [shopName, email, phoneNumber, req.params.id]);
    res.status(200).json({ message: 'Shop updated successfully' });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.put('/api/customer/profile/:id', async (req, res) => {
  try {
    const { fullName, phoneNumber, email } = req.body;
    await pool.execute('UPDATE customers SET fullName = ?, phoneNumber = ?, email = ? WHERE id = ?', [fullName, phoneNumber, email, req.params.id]);
    res.status(200).json({ message: 'Customer Profile updated successfully' });
  } catch (error) { res.status(500).json({ message: 'Server Error', error: error.message }); }
});

// CHAT ROUTES
app.post('/api/chat', upload.single('chatImage'), async (req, res) => {
  try {
    const { customer_id, seller_id, sender, message, existing_image_url } = req.body;
    const baseUrl = process.env.BACKEND_URL || 'https://backend.buystore.io';
    const image_url = req.file 
      ? `${baseUrl}/uploads/${req.file.filename}` 
      : (existing_image_url || null);
    
    await pool.execute(
      'INSERT INTO messages (customer_id, seller_id, sender, message, image_url) VALUES (?, ?, ?, ?, ?)', 
      [customer_id, seller_id, sender, message || '', image_url]
    );
    res.status(201).json({ success: true });
  } catch (error) { 
    console.error(error);
    res.status(500).json({ message: 'Server Error' }); 
  }
});

app.get('/api/chat/:customerId/:sellerId', async (req, res) => {
  try {
    const [messages] = await pool.execute('SELECT * FROM messages WHERE customer_id = ? AND seller_id = ? ORDER BY created_at ASC', [req.params.customerId, req.params.sellerId]);
    res.status(200).json(messages);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/chat/customer/:id/contacts', async (req, res) => {
  try {
    const [contacts] = await pool.execute(`SELECT DISTINCT s.id, s.shopName FROM messages m JOIN sellers s ON m.seller_id = s.id WHERE m.customer_id = ?`, [req.params.id]);
    res.status(200).json(contacts);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/chat/seller/:id/contacts', async (req, res) => {
  try {
    const [contacts] = await pool.execute(`SELECT DISTINCT c.id, c.fullName FROM messages m JOIN customers c ON m.customer_id = c.id WHERE m.seller_id = ?`, [req.params.id]);
    res.status(200).json(contacts);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

// ORDER & CHECKOUT ROUTES
app.get('/api/products/single/:id', async (req, res) => {
  try {
    const [product] = await pool.execute('SELECT p.*, s.shopName FROM products p JOIN sellers s ON p.seller_id = s.id WHERE p.id = ?', [req.params.id]);
    if (product.length === 0) return res.status(404).json({ message: 'Product not found' });
    res.status(200).json(product[0]);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customer_id, items, shipping_name, shipping_phone, shipping_address } = req.body;
    const order_number = 'ORD-' + Date.now(); 

    for (let item of items) {
      await pool.execute(
        'INSERT INTO orders (order_number, customer_id, shipping_name, shipping_phone, shipping_address, seller_id, product_id, product_name, price, quantity, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [order_number, customer_id, shipping_name || '', shipping_phone || '', shipping_address || '', item.seller_id, item.id, item.title, item.price, item.quantity, item.price * item.quantity, 'Pending']
      );
    }
    res.status(201).json({ message: 'Order Placed Successfully!', order_number });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/orders/customer/:id', async (req, res) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.status(200).json(orders);
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/orders/seller/:id', async (req, res) => {
  try {
    const [orders] = await pool.execute('SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC', [req.params.id]);
    const [sales] = await pool.execute('SELECT SUM(total_price) as totalSale FROM orders WHERE seller_id = ? AND status != "Cancelled"', [req.params.id]);
    res.status(200).json({ orders, totalSale: sales[0].totalSale || 0 });
  } catch (error) { res.status(500).json({ message: 'Server Error' }); }
});

app.get('/api/orders/seller-all/:id', async (req, res) => {
  try {
    const [receivedOrders] = await pool.execute('SELECT * FROM orders WHERE seller_id = ? ORDER BY created_at DESC', [req.params.id]);
    const [placedOrders] = await pool.execute('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC', [req.params.id]);
    
    const allOrders = [...receivedOrders, ...placedOrders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const [sales] = await pool.execute('SELECT SUM(total_price) as totalSale FROM orders WHERE seller_id = ? AND status != "Cancelled"', [req.params.id]);
    
    res.status(200).json({ orders: allOrders, received: receivedOrders, placed: placedOrders, totalSale: sales[0].totalSale || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' }); 
  }
});

app.put('/api/orders/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    res.status(200).json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// 6. WITHDRAWAL ROUTES
app.post('/api/withdrawals', async (req, res) => {
  try {
    const { seller_id, amount, payment_method, wallet_address, note } = req.body;
    await pool.execute(
      'INSERT INTO withdrawals (seller_id, amount, payment_method, wallet_address, note, status) VALUES (?, ?, ?, ?, ?, ?)',
      [seller_id, amount, payment_method, wallet_address, note || '', 'Pending']
    );
    res.status(201).json({ message: 'Withdrawal requested successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

app.get('/api/withdrawals/seller/:id', async (req, res) => {
  try {
    const [withdrawals] = await pool.execute('SELECT * FROM withdrawals WHERE seller_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.status(200).json(withdrawals);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Dynamic Port for Live Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});