const { query, run, get } = require('../config/db');

const nowTimestamp = () => {
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date}_${time}`;
};

const getAllFeedback = async (req, res) => {
  try {
    const feedbackList = await query('SELECT * FROM user_feedback ORDER BY id DESC');
    return res.json({ success: true, data: feedbackList });
  } catch (error) {
    console.error('Fetch feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch feedback.' });
  }
};

const createFeedback = async (req, res) => {
  try {
    const { feed_name, feed_email, feed_score, comments } = req.body;
    if (!feed_name || !feed_email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const timestamp = nowTimestamp();
    const result = await run(
      'INSERT INTO user_feedback (feed_name, feed_email, feed_score, comments, timestamp) VALUES (?, ?, ?, ?, ?)',
      [feed_name.trim(), feed_email.trim().toLowerCase(), String(feed_score || 5), comments || '', timestamp]
    );

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully!',
      id: result.lastID,
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to record feedback.' });
  }
};

const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { feed_score, comments } = req.body;

    const existing = await get('SELECT id FROM user_feedback WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Feedback record not found.' });
    }

    await run('UPDATE user_feedback SET feed_score = ?, comments = ? WHERE id = ?', [
      String(feed_score || 5),
      comments || '',
      id,
    ]);

    return res.json({ success: true, message: 'Feedback updated successfully.' });
  } catch (error) {
    console.error('Update feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update feedback.' });
  }
};

const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT id FROM user_feedback WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Feedback record not found.' });
    }

    await run('DELETE FROM user_feedback WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Feedback deleted successfully.' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete feedback.' });
  }
};

module.exports = {
  getAllFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
};
