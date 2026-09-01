const fs = require('fs');
const path = require('path');
const { query, run, get } = require('../config/db');
const { UPLOAD_DIR } = require('../config/env');

const getDashboardMetrics = async (req, res) => {
  try {
    const totalUsersRow = await get('SELECT COUNT(*) as count FROM user_data');
    const totalFeedbackRow = await get('SELECT COUNT(*) as count FROM user_feedback');
    const allUsers = await query('SELECT resume_score, predicted_field, user_level FROM user_data');
    const allFeedback = await query('SELECT feed_score FROM user_feedback');

    const totalScans = totalUsersRow ? totalUsersRow.count : 0;
    const totalReviews = totalFeedbackRow ? totalFeedbackRow.count : 0;

    let avgScore = 0;
    if (allUsers.length > 0) {
      const sumScores = allUsers.reduce((acc, curr) => acc + (parseFloat(curr.resume_score) || 0), 0);
      avgScore = Math.round((sumScores / allUsers.length) * 10) / 10;
    }

    let avgRating = 0;
    if (allFeedback.length > 0) {
      const sumRatings = allFeedback.reduce((acc, curr) => acc + (parseFloat(curr.feed_score) || 0), 0);
      avgRating = Math.round((sumRatings / allFeedback.length) * 10) / 10;
    }

    // PDF files count
    let storedPdfs = 0;
    if (fs.existsSync(UPLOAD_DIR)) {
      storedPdfs = fs.readdirSync(UPLOAD_DIR).filter((f) => f.endsWith('.pdf')).length;
    }

    // Distributions
    const fieldCounts = {};
    const levelCounts = {};
    allUsers.forEach((u) => {
      const field = u.predicted_field || 'General';
      const level = u.user_level || 'Fresher';
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
      levelCounts[level] = (levelCounts[level] || 0) + 1;
    });

    return res.json({
      success: true,
      data: {
        totalScans,
        avgScore,
        avgRating,
        totalReviews,
        storedPdfs,
        fieldDistribution: fieldCounts,
        levelDistribution: levelCounts,
      },
    });
  } catch (error) {
    console.error('Admin metrics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin metrics.' });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM user_data ORDER BY id DESC';
    let params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      sql = `
        SELECT * FROM user_data 
        WHERE name LIKE ? OR email LIKE ? OR act_name LIKE ? OR act_mail LIKE ? OR predicted_field LIKE ? OR user_level LIKE ?
        ORDER BY id DESC
      `;
      params = [term, term, term, term, term, term];
    }

    const users = await query(sql, params);
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error('Admin fetch users error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch candidate records.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await get('SELECT id, pdf_name FROM user_data WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Candidate record not found.' });
    }

    await run('DELETE FROM user_data WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Candidate record deleted successfully.' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
};

const getStoredPdfs = async (req, res) => {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(UPLOAD_DIR).filter((f) => f.endsWith('.pdf'));
    const pdfs = files.map((filename) => {
      const filePath = path.join(UPLOAD_DIR, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        sizeKb: Math.round((stats.size / 1024) * 10) / 10,
        createdAt: stats.birthtime,
      };
    });

    return res.json({ success: true, data: pdfs });
  } catch (error) {
    console.error('Admin get pdfs error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve PDF library.' });
  }
};

const exportCsv = async (req, res) => {
  try {
    const users = await query('SELECT * FROM user_data ORDER BY id DESC');
    if (users.length === 0) {
      return res.status(400).send('No data available to export.');
    }

    const headers = Object.keys(users[0]).join(',');
    const rows = users.map((u) => {
      return Object.values(u)
        .map((val) => `"${String(val || '').replace(/"/g, '""')}"`)
        .join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=candidates_export.csv');
    return res.send(csvContent);
  } catch (error) {
    console.error('Export CSV error:', error);
    return res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
};

module.exports = {
  getDashboardMetrics,
  getAllUsers,
  deleteUser,
  getStoredPdfs,
  exportCsv,
};
