const pool = require('../config/db');

// GET /api/products?category=&search=
const getProducts = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1 = 1
    `;
    const params = [];

    if (category) {
      query += ' AND p.category_id = ?';
      params.push(category);
    }

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products (admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, category_id, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, description, price, image_url, category_id, stock)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, price, image_url || null, category_id || null, stock || 0]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      price,
      image_url,
      category_id,
      stock: stock || 0
    });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/:id (admin only)
const updateProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, category_id, stock } = req.body;
    const { id } = req.params;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const [result] = await pool.query(
      `UPDATE products 
       SET name = ?, description = ?, price = ?, image_url = ?, category_id = ?, stock = ?
       WHERE id = ?`,
      [name, description || null, price, image_url || null, category_id || null, stock || 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      id: Number(id),
      name,
      description,
      price,
      image_url,
      category_id,
      stock: stock || 0
    });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        message: 'Cannot delete product as it is referenced in past orders. Try setting stock to 0 instead.' 
      });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  getCategories, 
  createProduct,
  updateProduct,
  deleteProduct
};
