'use strict';

const express = require('express');

module.exports = (getPool) => {
  const router = express.Router();

  // GET /orders - Get all orders
  router.get('/', async (req, res) => {
    try {
      const db = getPool();
      const [rows] = await db.execute(`
        SELECT o.id, o.amount, o.status, o.created_at,
               u.name AS user_name, u.email AS user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC LIMIT 100
      `);
      res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
      console.error('GET /orders error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /orders - Create order
  router.post('/', async (req, res) => {
    try {
      const { user_id, amount } = req.body;
      if (!user_id || !amount) {
        return res.status(400).json({ success: false, error: 'user_id and amount are required' });
      }

      const db = getPool();
      const [result] = await db.execute(
        'INSERT INTO orders (user_id, amount, status) VALUES (?, ?, ?)',
        [user_id, amount, 'pending']
      );
      res.status(201).json({
        success: true,
        data: { id: result.insertId, user_id, amount, status: 'pending' }
      });
    } catch (error) {
      console.error('POST /orders error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
