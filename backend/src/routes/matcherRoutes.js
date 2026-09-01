const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { matchJob, tailorResume, generateCoverLetter, exportPdf } = require('../controllers/matcherController');

router.post('/match', matchJob);
router.post('/tailor', tailorResume);
router.post('/cover-letter', generateCoverLetter);
router.post('/export-pdf', exportPdf);

module.exports = router;
