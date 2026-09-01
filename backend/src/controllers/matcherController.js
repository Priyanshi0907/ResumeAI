const mlClient = require('../services/mlClient');

const matchJob = async (req, res) => {
  try {
    const { resume_text, jd_text, name } = req.body;
    if (!resume_text || !jd_text) {
      return res.status(400).json({ success: false, message: 'Both resume text and job description are required.' });
    }

    const result = await mlClient.matchJob(resume_text, jd_text, name || 'Candidate');
    return res.json(result);
  } catch (error) {
    console.error('Match job error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Error matching resume to job description.',
    });
  }
};

const tailorResume = async (req, res) => {
  try {
    const { resume_text, jd_text, name, missing_keywords } = req.body;
    if (!resume_text || !jd_text) {
      return res.status(400).json({ success: false, message: 'Resume text and job description are required.' });
    }

    const result = await mlClient.tailorResume(resume_text, jd_text, name || 'Candidate', missing_keywords || []);
    return res.json(result);
  } catch (error) {
    console.error('Tailor resume error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Error tailoring resume.',
    });
  }
};

const generateCoverLetter = async (req, res) => {
  try {
    const { resume_text, jd_text, name } = req.body;
    if (!resume_text || !jd_text) {
      return res.status(400).json({ success: false, message: 'Resume text and job description are required.' });
    }

    const result = await mlClient.generateCoverLetter(resume_text, jd_text, name || 'Candidate');
    return res.json(result);
  } catch (error) {
    console.error('Cover letter error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Error generating cover letter.',
    });
  }
};

const exportPdf = async (req, res) => {
  try {
    const { resume_text, template, name } = req.body;
    if (!resume_text) {
      return res.status(400).json({ success: false, message: 'Resume text is required.' });
    }

    const pdfBuffer = await mlClient.generatePdf(resume_text, template || 'modern_single', name || 'Candidate');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=tailored_resume_${template || 'modern'}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Export PDF error:', error);
    return res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || 'Error generating PDF.',
    });
  }
};

module.exports = {
  matchJob,
  tailorResume,
  generateCoverLetter,
  exportPdf,
};
