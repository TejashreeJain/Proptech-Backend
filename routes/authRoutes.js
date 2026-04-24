const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUsers,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Public
router.post('/login', login);
router.post('/register', register);

// Private (authentication required)
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.put('/users/:id/status', protect, toggleUserStatus);

module.exports = router;
