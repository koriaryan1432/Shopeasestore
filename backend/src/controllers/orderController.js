const pool = require('../config/db');

// POST /api/orders  { shipping_address }
// Converts the current user's cart into an order inside a transaction.
const placeOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { shipping_address } = req.body;
    await connection.beginTransaction();

    const [cartItems] = await connection.query(
      `SELECT ci.product_id, ci.quantity, p.price, p.stock, p.name
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Validate stock for every item before committing anything
    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({ message: `Not enough stock for "${item.name}"` });
      }
    }

    const total = cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, status) VALUES (?, ?, ?, ?)',
      [req.user.id, total, shipping_address || '', 'pending']
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price]
      );

      await connection.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    await connection.query('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);

    await connection.commit();

    res.status(201).json({ message: 'Order placed successfully', order_id: orderId, total });
  } catch (err) {
    await connection.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
};

// GET /api/orders - order history for the logged-in user, with line items
const getOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/orders/admin/stats (admin only)
const getAdminStats = async (req, res) => {
  try {
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_products }]] = await pool.query('SELECT COUNT(*) AS total_products FROM products');
    const [[{ total_orders }]] = await pool.query('SELECT COUNT(*) AS total_orders FROM orders');
    const [[{ total_revenue }]] = await pool.query("SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'cancelled'");

    res.json({
      total_users,
      total_products,
      total_orders,
      total_revenue: Number(total_revenue)
    });
  } catch (err) {
    console.error('Get admin stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/orders/admin/list (admin only)
const getAdminOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email 
       FROM orders o 
       JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );

    for (const order of orders) {
      const [items] = await pool.query(
        `SELECT oi.quantity, oi.price, p.name, p.image_url
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (err) {
    console.error('Get admin orders error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/orders/admin/status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { order_id, status } = req.body;

    if (!order_id || !status) {
      return res.status(400).json({ message: 'Order ID and status are required' });
    }

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, order_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({ message: 'Order status updated successfully', order_id, status });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { 
  placeOrder, 
  getOrders,
  getAdminStats,
  getAdminOrders,
  updateOrderStatus
};
