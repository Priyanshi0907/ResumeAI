const mlClient = require('../services/mlClient');

const getCourses = async (req, res) => {
  try {
    const courses = await mlClient.getCourses();
    return res.json({ success: true, data: courses });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch courses.' });
  }
};

const getVideos = async (req, res) => {
  try {
    const videos = await mlClient.getVideos();
    return res.json({ success: true, data: videos });
  } catch (error) {
    console.error('Fetch videos error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch videos.' });
  }
};

const getInsights = async (req, res) => {
  try {
    const insights = await mlClient.getInsights();
    return res.json({ success: true, data: insights });
  } catch (error) {
    console.error('Fetch insights error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch insights.' });
  }
};

module.exports = {
  getCourses,
  getVideos,
  getInsights,
};
