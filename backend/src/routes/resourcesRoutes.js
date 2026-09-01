const express = require('express');
const router = express.Router();
const { getCourses, getVideos, getInsights } = require('../controllers/resourcesController');

router.get('/courses', getCourses);
router.get('/videos', getVideos);
router.get('/insights', getInsights);

module.exports = router;
