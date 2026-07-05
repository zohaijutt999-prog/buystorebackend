const fs = require('fs');

const productsList = [
  { price: 10, title: "Wireless Optical Mouse", category: "Electronics", img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80" },
  { price: 15, title: "High-Speed USB-C Cable Pack", category: "Electronics", img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80" },
  { price: 25, title: "Stainless Steel Thermal Water Bottle", category: "Home & Living", img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=400&q=80" },
  { price: 35, title: "Portable Bluetooth Speaker", category: "Electronics", img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80" },
  { price: 45, title: "Fast Charging Power Bank 20000mAh", category: "Electronics", img: "https://images.unsplash.com/photo-1609592424209-27d4726e1a12?auto=format&fit=crop&w=400&q=80" },
  { price: 65, title: "Ergonomic RGB Gaming Keyboard", category: "Electronics", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=400&q=80" },
  { price: 70, title: "True Wireless Noise-Cancelling Earbuds", category: "Electronics", img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80" },
  { price: 85, title: "Premium Leather Gym Duffle Bag", category: "Fashion", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=400&q=80" },
  { price: 95, title: "Minimalist Analog Wrist Watch", category: "Accessories", img: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=400&q=80" },
  { price: 100, title: "Smart Fitness Tracker Band", category: "Electronics", img: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=400&q=80" },
  { price: 107, title: "Orthopedic Memory Foam Bed Pillow", category: "Home & Living", img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80" },
  { price: 115, title: "Professional Studio Condenser Microphone", category: "Electronics", img: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=400&q=80" },
  { price: 125, title: "Air Purifier with HEPA Filter", category: "Home Appliances", img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=400&q=80" },
  { price: 130, title: "Polarized Designer Aviator Sunglasses", category: "Accessories", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=400&q=80" },
  { price: 135, title: "Mechanical Espresso Coffee Grinder", category: "Home Appliances", img: "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=400&q=80" },
  { price: 140, title: "Smart LED Desk Lamp with Wireless Charger", category: "Electronics", img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&q=80" },
  { price: 145, title: "Luxury Silk Bedding Sheet Set 4-Piece", category: "Home & Living", img: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80" },
  { price: 150, title: "Over-Ear Wireless ANC Headphones", category: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80" },
  { price: 160, title: "HD 1080p Web Camera with Dual Mics", category: "Electronics", img: "https://images.unsplash.com/photo-1587826504074-0f47bc1838cf?auto=format&fit=crop&w=400&q=80" },
  { price: 170, title: "Compact Digital Air Fryer 5.8 QT", category: "Home Appliances", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80" },
  { price: 180, title: "Ergonomic Mesh Executive Office Chair", category: "Furniture", img: "https://images.unsplash.com/photo-1580481077494-e3299ac2fef6?auto=format&fit=crop&w=400&q=80" },
  { price: 190, title: "Smart Home Security Camera System (2-Pack)", category: "Electronics", img: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80" },
  { price: 200, title: "Ultra-Fast 1TB Portable SSD", category: "Electronics", img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=400&q=80" },
  { price: 230, title: "Cordless Stick Vacuum Cleaner", category: "Home Appliances", img: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=400&q=80" },
  { price: 250, title: "Automatic Espresso Coffee Machine", category: "Home Appliances", img: "https://images.unsplash.com/photo-1517668808822-9a429a831e54?auto=format&fit=crop&w=400&q=80" },
  { price: 300, title: "GPS Multisport Smartwatch Pro", category: "Electronics", img: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80" },
  { price: 335, title: "27-Inch 144Hz IPS Gaming Monitor", category: "Electronics", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80" },
  { price: 380, title: "Robotic Vacuum Cleaner with Mop & Dock", category: "Home Appliances", img: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=400&q=80" },
  { price: 450, title: "High-Performance Electric Kick Scooter", category: "Sports & Outdoors", img: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80" },
  { price: 500, title: "Flagship 5G Unlocked Smartphone 256GB", category: "Electronics", img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80" }
];

let unions = productsList.map((item, index) => {
  const titleSql = item.title.replace(/'/g, "\\'");
  const prefix = index === 0 ? 'SELECT' : 'UNION ALL SELECT';
  return `${prefix} '${titleSql}' AS title, '${item.category}' AS category, ${item.price.toFixed(2)} AS price, '${item.img}' AS img`;
}).join('\n  ');

const sqlContent = `-- Universal Products Import for phpMyAdmin
-- This script automatically disables foreign key errors and gives ALL 30 products to ALL existing sellers!

SET FOREIGN_KEY_CHECKS = 0;

-- Ensure at least one official seller exists in case the sellers table is empty
INSERT IGNORE INTO sellers (id, fullName, email, phoneNumber, shopName, password, idProofType, isApproved) 
VALUES (1, 'Official Store Owner', 'official@buystore.io', '1234567890', 'Buystore Official', 'seller123', 'National ID', 1);

DELETE FROM products;

INSERT INTO products (seller_id, title, category, price, stock_qty, description, profit, image_url)
SELECT 
  s.id AS seller_id,
  p.title,
  p.category,
  p.price,
  50 AS stock_qty,
  CONCAT('High quality ', p.title, ' with premium warranty and fast shipping.') AS description,
  ROUND(p.price * 0.20, 2) AS profit,
  p.img AS image_url
FROM sellers s
CROSS JOIN (
  ${unions}
) p;

SET FOREIGN_KEY_CHECKS = 1;
`;

fs.writeFileSync('products_universal_import.sql', sqlContent, 'utf8');
console.log('✅ Successfully generated products_universal_import.sql!');
