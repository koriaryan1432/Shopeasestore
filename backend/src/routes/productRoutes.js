const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Admin-only routes
router.post('/', authenticate, isAdmin, createProduct);
router.put('/:id', authenticate, isAdmin, updateProduct);
router.delete('/:id', authenticate, isAdmin, deleteProduct);

module.exports = router;
