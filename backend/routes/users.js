'use strict';

const express = require('express');

module.exports = (getPool) => {
  const router = express.Router();

  // GET /users - Get all users
  router.get('/', async (req, res) => {
    try {
      const db = getPool();
      const [rows] = await db.execute(
        'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC LIMIT 100'
      );
      res.json({ success: true, data: rows, count: rows.length });
    } catch (error) {
      console.error('GET /users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /users/:id - Get single user
  router.get('/:id', async (req, res) => {
    try {
      const db = getPool();
      const [rows] = await db.execute(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [req.params.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: rows[0] });
    } catch (error) {
      console.error('GET /users/:id error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /users - Create user
  router.post('/', async (req, res) => {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ success: false, error: 'name and email are required' });
      }

      const db = getPool();
      const [result] = await db.execute(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );
      res.status(201).json({
        success: true,
        data: { id: result.insertId, name, email }
      });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, error: 'Email already exists' });
      }
      console.error('POST /users error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /users/:id - Update user
  router.put('/:id', async (req, res) => {
    try {
      const { name, email } = req.body;
      const db = getPool();
      const [result] = await db.execute(
        'UPDATE users SET name = ?, email = ? WHERE id = ?',
        [name, email, req.params.id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, message: 'User updated' });
    } catch (error) {
      console.error('PUT /users/:id error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /users/:id - Delete user
  router.delete('/:id', async (req, res) => {
    try {
      const db = getPool();
      const [result] = await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted' });
    } catch (error) {
      console.error('DELETE /users/:id error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
};
