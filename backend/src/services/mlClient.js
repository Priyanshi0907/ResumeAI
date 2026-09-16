const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const { FASTAPI_URL } = require('../config/env');

const mlApi = axios.create({
  baseURL: FASTAPI_URL,
  timeout: 120000, // 120s timeout to allow Render free tier to wake up from cold-sleep
});

const localApi = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 120000,
});

async function callMlApi(requestFn) {
  try {
    return await requestFn(mlApi);
  } catch (err) {
    const isExternal = FASTAPI_URL && !FASTAPI_URL.includes('127.0.0.1') && !FASTAPI_URL.includes('localhost');
    if (isExternal) {
      console.warn(`[MLClient] Primary ML endpoint failed (${err.message}). Retrying via local fallback...`);
      try {
        return await requestFn(localApi);
      } catch (localErr) {
        throw localErr;
      }
    }
    throw err;
  }
}

const parseAndAnalyzeResume = async (filePath, formDataFields = {}) => {
  return await callMlApi(async (client) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    if (formDataFields.act_name) form.append('act_name', formDataFields.act_name);
    if (formDataFields.act_mail) form.append('act_mail', formDataFields.act_mail);
    if (formDataFields.act_mob) form.append('act_mob', formDataFields.act_mob);
    if (formDataFields.linkedin) form.append('linkedin', formDataFields.linkedin);
    if (formDataFields.github) form.append('github', formDataFields.github);

    const response = await client.post('/api/ml/parse-and-analyze', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return response.data;
  });
};

const getAITips = async (resumeText) => {
  return await callMlApi(async (client) => {
    const response = await client.post('/api/ml/ai-tips', { resume_text: resumeText });
    return response.data;
  });
};

const matchJob = async (resumeText, jdText, name = 'Candidate') => {
  return await callMlApi(async (client) => {
    const response = await client.post('/api/ml/match-job', {
      resume_text: resumeText,
      jd_text: jdText,
      name,
    });
    return response.data;
  });
};

const tailorResume = async (resumeText, jdText, name = 'Candidate', missingKeywords = []) => {
  return await callMlApi(async (client) => {
    const response = await client.post('/api/ml/tailor-resume', {
      resume_text: resumeText,
      jd_text: jdText,
      name,
      missing_keywords: missingKeywords,
    });
    return response.data;
  });
};

const generateCoverLetter = async (resumeText, jdText, name = 'Candidate') => {
  return await callMlApi(async (client) => {
    const response = await client.post('/api/ml/generate-cover-letter', {
      resume_text: resumeText,
      jd_text: jdText,
      name,
    });
    return response.data;
  });
};

const generatePdf = async (resumeText, template = 'modern_single', name = 'Candidate Name') => {
  return await callMlApi(async (client) => {
    const response = await client.post(
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
  });
};

const getCourses = async () => {
  return await callMlApi(async (client) => {
    const response = await client.get('/api/ml/courses');
    return response.data;
  });
};

const getVideos = async () => {
  return await callMlApi(async (client) => {
    const response = await client.get('/api/ml/videos');
    return response.data;
  });
};

const getInsights = async () => {
  return await callMlApi(async (client) => {
    const response = await client.get('/api/ml/insights');
    return response.data;
  });
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
