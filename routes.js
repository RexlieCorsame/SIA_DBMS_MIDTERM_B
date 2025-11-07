import { Router } from 'express';
import db from './db.js'; 

const router = Router();


const handleDatabaseError = (res, error) => {
  console.error('Database Error:', error);
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'A record with this value already exists (e.g., duplicate email).' });
  }
  res.status(500).json({ error: 'Internal Server Error' });
};


router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.post('/users', async (req, res) => {

  console.log('--- POST /api/users route hit ---');
  console.log('Received body:', req.body);
  
  
  try {
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'All fields (first_name, last_name, email) are required.' });
    }
    const sql = 'INSERT INTO users (first_name, last_name, email) VALUES (?, ?, ?)';
    const [result] = await db.query(sql, [first_name, last_name, email]);
    res.status(201).json({ id: result.insertId, first_name, last_name, email });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email } = req.body;
    if (!first_name || !last_name || !email) {
      return res.status(400).json({ error: 'All fields (first_name, last_name, email) are required.' });
    }
    const sql = 'UPDATE users SET first_name = ?, last_name = ?, email = ? WHERE id = ?';
    const [result] = await db.query(sql, [first_name, last_name, email, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: Number(id), first_name, last_name, email });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: `User with ID ${id} deleted successfully` });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.get('/products', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products');
    res.json(rows);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.get('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    handleDatabaseError(res, error);
  }
});


router.post('/products', async (req, res) => {
  
  console.log('--- POST /api/products route hit ---');
  console.log('Received body:', req.body);
  

  try {
    const { name, description, price, stock_quantity } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }
    const sql = 'INSERT INTO products (name, description, price, stock_quantity) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(sql, [name, description, price, stock_quantity || 0]);
    res.status(201).json({ id: result.insertId, name, description, price, stock_quantity });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock_quantity } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required.' });
    }
    const sql = 'UPDATE products SET name = ?, description = ?, price = ?, stock_quantity = ? WHERE id = ?';
    const [result] = await db.query(sql, [name, description, price, stock_quantity || 0, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ id: Number(id), name, description, price, stock_quantity });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: `Product with ID ${id} deleted successfully` });
  } catch (error) {
    handleDatabaseError(res, error);
  }
});

export default router;