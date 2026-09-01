const express = require('express');
const router = express.Router();
const { register, login, getMe, adminLogin } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getMe);
router.post('/admin-login', adminLogin);

module.exports = router;
