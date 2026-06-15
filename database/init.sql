-- ============================================
-- ShopEase E-Commerce Database Schema + Seed
-- ============================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) DEFAULT NULL,
  is_phone_verified TINYINT(1) DEFAULT 0,
  is_email_verified TINYINT(1) DEFAULT 0,
  google_id VARCHAR(255) DEFAULT NULL,
  welcome_sent TINYINT(1) DEFAULT 0,
  role ENUM('customer','admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTPs
CREATE TABLE IF NOT EXISTS otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  identifier VARCHAR(150) NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('email', 'phone') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category_id INT,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Cart items
CREATE TABLE IF NOT EXISTS cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending','paid','shipped','delivered','cancelled') DEFAULT 'pending',
  shipping_address VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Order items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================
-- Seed data
-- ============================================

INSERT INTO categories (name) VALUES
  ('Electronics'), ('Fashion'), ('Home & Kitchen'), ('Books');

INSERT INTO products (name, description, price, image_url, category_id, stock) VALUES
('Wireless Headphones', 'Noise-cancelling over-ear bluetooth headphones with 30hr battery life', 2999.00, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', 1, 50),
('Smartwatch', 'Fitness tracker with heart-rate monitor and sleep tracking', 4499.00, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', 1, 30),
('Bluetooth Speaker', 'Portable waterproof speaker with deep bass', 1799.00, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&q=80', 1, 45),
('Cotton T-Shirt', 'Comfortable everyday cotton t-shirt, available in multiple colors', 599.00, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80', 2, 100),
('Denim Jacket', 'Classic blue denim jacket with a relaxed fit', 1899.00, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80', 2, 40),
('Running Shoes', 'Lightweight breathable running shoes', 2499.00, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', 2, 60),
('Non-stick Pan Set', '3-piece non-stick cookware set, induction compatible', 1299.00, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&q=80', 3, 25),
('Coffee Maker', 'Automatic drip coffee maker with timer', 2199.00, 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&q=80', 3, 20),
('LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port', 899.00, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', 3, 70),
('The Pragmatic Programmer', 'Classic software engineering book on craftsmanship', 899.00, 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80', 4, 60),
('Clean Code', 'A handbook of agile software craftsmanship', 799.00, 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&q=80', 4, 60),
('Atomic Habits', 'Practical guide to building good habits', 499.00, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80', 4, 80);

-- Seed Admin User (Email: admin@shopease.com, Password: admin123)
INSERT INTO users (name, email, password, role, is_email_verified, is_phone_verified, welcome_sent) VALUES
('ShopEase Admin', 'admin@shopease.com', '$2a$10$SoNfWRS9jj4wiAefKOvR/uTYia5kZR8A0MTQvLNZdrDEnKCRHk8Uu', 'admin', 1, 1, 1);

