const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run } = require('../config/db');
const { JWT_SECRET, ADMIN_USER, ADMIN_PASS } = require('../config/env');

const nowTimestamp = () => {
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date}_${time}`;
};

// Candidate Register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields (name, email, password) are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await get('SELECT id FROM app_users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const timestamp = nowTimestamp();
    const result = await run(
      'INSERT INTO app_users (name, email, password, timestamp) VALUES (?, ?, ?, ?)',
      [name.trim(), cleanEmail, hashedPassword, timestamp]
    );

    const user = { id: result.lastID, name: name.trim(), email: cleanEmail };
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      user,
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Candidate Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await get('SELECT * FROM app_users WHERE email = ?', [cleanEmail]);
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    // Compare password (supports both bcrypt and plaintext legacy)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Get current profile
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const user = await get('SELECT id, name, email, timestamp FROM app_users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// Staff Admin Login
const adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const token = jwt.sign({ username, isAdmin: true }, JWT_SECRET, { expiresIn: '1d' });
      return res.json({
        success: true,
        message: 'Admin authenticated successfully.',
        token,
      });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Admin login error.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  adminLogin,
};
