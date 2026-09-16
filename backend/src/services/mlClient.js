const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { FASTAPI_URL } = require('../config/env');

const mlApi = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 120000, // 120s timeout to allow Render free tier to wake up from cold-sleep
});

const parseAndAnalyzeResume = async (filePath, formDataFields = {}) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));
  if (formDataFields.act_name) form.append('act_name', formDataFields.act_name);
  if (formDataFields.act_mail) form.append('act_mail', formDataFields.act_mail);
  if (formDataFields.act_mob) form.append('act_mob', formDataFields.act_mob);
  if (formDataFields.linkedin) form.append('linkedin', formDataFields.linkedin);
  if (formDataFields.github) form.append('github', formDataFields.github);

  const response = await mlApi.post('/api/ml/parse-and-analyze', form, {
    headers: {
      ...form.getHeaders(),
    },
  });
  return response.data;
};

const getAITips = async (resumeText) => {
  const response = await mlApi.post('/api/ml/ai-tips', { resume_text: resumeText });
  return response.data;
};

const matchJob = async (resumeText, jdText, name = 'Candidate') => {
  const response = await mlApi.post('/api/ml/match-job', {
    resume_text: resumeText,
    jd_text: jdText,
    name,
  });
  return response.data;
};

const tailorResume = async (resumeText, jdText, name = 'Candidate', missingKeywords = []) => {
  const response = await mlApi.post('/api/ml/tailor-resume', {
    resume_text: resumeText,
    jd_text: jdText,
    name,
    missing_keywords: missingKeywords,
  });
  return response.data;
};

const generateCoverLetter = async (resumeText, jdText, name = 'Candidate') => {
  const response = await mlApi.post('/api/ml/generate-cover-letter', {
    resume_text: resumeText,
    jd_text: jdText,
    name,
  });
  return response.data;
};

const generatePdf = async (resumeText, template = 'modern_single', name = 'Candidate Name') => {
  const response = await mlApi.post(
    '/api/ml/generate-pdf',
    {
      resume_text: resumeText,
      template,
      name,
    },
    {
      responseType: 'arraybuffer',
    }
  );
  return response.data;
};

const getCourses = async () => {
  const response = await mlApi.get('/api/ml/courses');
  return response.data;
};

const getVideos = async () => {
  const response = await mlApi.get('/api/ml/videos');
  return response.data;
};

const getInsights = async () => {
  const response = await mlApi.get('/api/ml/insights');
  return response.data;
};

module.exports = {
  parseAndAnalyzeResume,
  getAITips,
  matchJob,
  tailorResume,
  generateCoverLetter,
  generatePdf,
  getCourses,
  getVideos,
  getInsights,
};
