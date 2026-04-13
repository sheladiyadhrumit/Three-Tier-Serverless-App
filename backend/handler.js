'use strict';

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const mysql2 = require('mysql2/promise');
require('dotenv').config();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS - Allow your CloudFront domain
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ─── Database Connection Pool ─────────────────────────────────────────────────
// Lambda reuses connections across warm invocations - use a pool!
let pool;

const getPool = () => {
  if (!pool) {
    pool = mysql2.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  return pool;
};

// ─── Routes ──────────────────────────────────────────────────────────────────

// Health Check
app.get('/health', async (req, res) => {
  try {
    const db = getPool();
    await db.execute('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'production'
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Import and use routes
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

app.use('/users', userRoutes(getPool));
app.use('/orders', orderRoutes(getPool));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Export for Lambda ────────────────────────────────────────────────────────
module.exports.handler = serverless(app);
