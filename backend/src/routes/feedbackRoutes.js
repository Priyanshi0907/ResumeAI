const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { optionalAuth, authenticateToken } = require('../middleware/auth');

// Anyone can read all feedback
router.get('/', getAllFeedback);

// Optional auth on create — links review to logged-in user if available
router.post('/', optionalAuth, createFeedback);

// Auth required for edit and delete — ownership enforced inside controller
router.put('/:id', authenticateToken, updateFeedback);
router.delete('/:id', authenticateToken, deleteFeedback);

module.exports = router;
