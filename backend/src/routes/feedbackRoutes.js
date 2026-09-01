const express = require('express');
const router = express.Router();
const {
  getAllFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

router.get('/', getAllFeedback);
router.post('/', createFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

module.exports = router;
