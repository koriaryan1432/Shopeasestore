const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart
} = require('../controllers/cartController');
const { authenticate } = require('../middleware/authMiddleware');

// All cart routes require a logged-in user
router.use(authenticate);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);

module.exports = router;
