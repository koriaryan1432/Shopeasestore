const pool = require('../config/db');

// GET /api/cart
const getCart = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.image_url, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?
       ORDER BY ci.id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/cart  { product_id, quantity }
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const qty = quantity && quantity > 0 ? quantity : 1;

    if (!product_id) {
      return res.status(400).json({ message: 'product_id is required' });
    }

    // If the item is already in the cart, increase its quantity instead of duplicating
    await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [req.user.id, product_id, qty, qty]
    );

    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/cart/:id  { quantity }
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ message: 'quantity is required' });
    }

    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
      return res.json({ message: 'Item removed from cart' });
    }

    await pool.query(
      'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );

    res.json({ message: 'Cart updated' });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/cart/:id
const removeFromCart = async (req, res) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    console.error('Remove from cart error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };
