const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from workspace root .env if available, or backend .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  FASTAPI_URL: process.env.FASTAPI_URL || 'http://127.0.0.1:8000',
  JWT_SECRET: process.env.JWT_SECRET || 'resumeai-jwt-secret-super-key-2026',
  SQLITE_PATH: path.resolve(__dirname, '../../resume_analyzer.db'),
  UPLOAD_DIR: path.resolve(__dirname, '../../../App/Uploaded_Resumes'),
  ADMIN_USER: process.env.ADMIN_USER || 'admin',
  ADMIN_PASS: process.env.ADMIN_PASS || 'admin@123',
};
