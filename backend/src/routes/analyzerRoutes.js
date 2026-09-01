const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { analyzeResume, getAITips } = require('../controllers/analyzerController');

router.post('/analyze', upload.single('resume'), analyzeResume);
router.post('/ai-tips', getAITips);

module.exports = router;
