const express = require('express');
const router = express.Router();
const { 
  placeOrder, 
  getOrders,
  getAdminStats,
  getAdminOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.use(authenticate);

// Admin-only order routes
router.get('/admin/stats', isAdmin, getAdminStats);
router.get('/admin/list', isAdmin, getAdminOrders);
router.put('/admin/status', isAdmin, updateOrderStatus);

// Customer order routes
router.post('/', placeOrder);
router.get('/', getOrders);

module.exports = router;
