const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getAuthConfig, 
  googleLogin, 
  sendOTP, 
  verifyOTP,
  getAdminUsers,
  updateUserRole
} = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/config', getAuthConfig);
router.post('/google', googleLogin);
router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);

// Admin-only user routes
router.get('/admin/users', authenticate, isAdmin, getAdminUsers);
router.put('/admin/users/:id/role', authenticate, isAdmin, updateUserRole);

module.exports = router;

