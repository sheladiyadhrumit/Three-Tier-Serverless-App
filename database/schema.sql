-- ============================================================
-- Three-Tier Serverless App - Database Schema
-- Amazon RDS MySQL 8.0
-- Run this file to set up your database from scratch
-- ============================================================

-- Create and select database
CREATE DATABASE IF NOT EXISTS myapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE myapp;

-- ─── Users Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  role         ENUM('user', 'admin') DEFAULT 'user',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders Table ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  user_id      INT NOT NULL,
  amount       DECIMAL(10, 2) NOT NULL,
  status       ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
  description  TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Products Table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10, 2) NOT NULL,
  stock        INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Sample Data ─────────────────────────────────────────────────────────────
INSERT INTO users (name, email, role) VALUES
  ('Karna Patel', 'karna.patel@example.com', 'admin'),
  ('Test User 1', 'user1@example.com', 'user'),
  ('Test User 2', 'user2@example.com', 'user');

INSERT INTO products (name, description, price, stock) VALUES
  ('Product A', 'Sample product A', 99.99, 100),
  ('Product B', 'Sample product B', 49.99, 50),
  ('Product C', 'Sample product C', 199.99, 25);

INSERT INTO orders (user_id, amount, status, description) VALUES
  (1, 99.99, 'completed', 'Order for Product A'),
  (2, 149.98, 'pending', 'Order for Product B x2'),
  (3, 199.99, 'processing', 'Order for Product C');

-- ─── Verify Setup ────────────────────────────────────────────────────────────
SELECT 'Setup complete!' AS message;
SELECT COUNT(*) AS user_count FROM users;
SELECT COUNT(*) AS order_count FROM orders;
SELECT COUNT(*) AS product_count FROM products;
