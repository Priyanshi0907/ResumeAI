const crypto = require('crypto');
const os = require('os');
const { run } = require('../config/db');
const mlClient = require('../services/mlClient');

const nowTimestamp = () => {
  const d = new Date();
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date}_${time}`;
};

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume file (PDF/DOCX) is required.' });
    }

    const filePath = req.file.path;
    const { act_name, act_mail, act_mob, linkedin, github } = req.body;

    // Call FastAPI ML service
    const rawMlResult = await mlClient.parseAndAnalyzeResume(filePath, {
      act_name: act_name || '',
      act_mail: act_mail || '',
      act_mob: act_mob || '',
      linkedin: linkedin || '',
      github: github || '',
    });

    const mlResult = rawMlResult?.data || rawMlResult || {};

    // Record system & geoinfo fallback
    const sec_token = crypto.randomBytes(8).toString('hex');
    const ip_add = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const host_name = os.hostname() || 'localhost';
    const dev_user = process.env.USERNAME || process.env.USER || 'Candidate';
    const os_name_ver = `${os.type()} ${os.release()}`;
    const timestamp = nowTimestamp();

    // Persist into user_data
    try {
      await run(
        `INSERT INTO user_data (
          sec_token, ip_add, host_name, dev_user, os_name_ver,
          latlong, city, state, country,
          act_name, act_mail, act_mob,
          name, email, resume_score, timestamp, no_of_pages,
          predicted_field, user_level, actual_skills,
          recommended_skills, recommended_courses, pdf_name,
          linkedin, github
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sec_token,
          ip_add,
          host_name,
          dev_user,
          os_name_ver,
          '',
          'Local',
          'Local',
          'Local',
          act_name || '',
          act_mail || '',
          act_mob || '',
          mlResult.parsed_name || act_name || '',
          mlResult.parsed_email || act_mail || '',
          String(mlResult.resume_score || 0),
          timestamp,
          String(mlResult.no_of_pages || 1),
          mlResult.predicted_field || 'General',
          mlResult.candidate_level || 'Fresher',
          JSON.stringify(mlResult.detected_skills || []),
          JSON.stringify(mlResult.recommended_skills || []),
          JSON.stringify((mlResult.recommended_courses || []).map((c) => (Array.isArray(c) ? c[0] : c))),
          req.file.filename,
          linkedin || '',
          github || '',
        ]
      );
    } catch (dbErr) {
      console.error('Failed to log user_data to database:', dbErr.message);
    }

    return res.json({
      success: true,
      data: mlResult,
    });
  } catch (error) {
    console.error('Analyzer error:', error);
    let friendlyMsg = error.response?.data?.detail || error.message || 'Error running resume analysis pipeline.';
    if (error.response?.status === 429 || error.message?.includes('429')) {
      friendlyMsg = 'AI rate limit reached. Please wait 1 minute before retrying.';
    } else if (error.response?.status === 502 || error.code === 'ECONNREFUSED' || error.message?.includes('502')) {
      friendlyMsg = 'The AI/ML service is currently waking up. Render free tier takes ~60 seconds to spin up on the first request. Please wait a minute and try again.';
    }
    return res.status(500).json({
      success: false,
      message: friendlyMsg,
    });
  }
};

const getAITips = async (req, res) => {
  try {
    const { resume_text } = req.body;
    if (!resume_text) {
      return res.status(400).json({ success: false, message: 'Resume text is required.' });
    }
    const result = await mlClient.getAITips(resume_text);
    return res.json(result);
  } catch (error) {
    console.error('AI tips error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Error generating AI tips.',
    });
  }
};

module.exports = {
  analyzeResume,
  getAITips,
};
