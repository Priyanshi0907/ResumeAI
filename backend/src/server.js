const express = require('express');
const cors = require('cors');
const path = require('path');
const { PORT, UPLOAD_DIR } = require('./config/env');

// Import routes
const authRoutes = require('./routes/authRoutes');
const analyzerRoutes = require('./routes/analyzerRoutes');
const matcherRoutes = require('./routes/matcherRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');
const resourcesRoutes = require('./routes/resourcesRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static route for stored resumes
app.use('/uploads', express.static(UPLOAD_DIR));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyzer', analyzerRoutes);
app.use('/api/matcher', matcherRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/resources', resourcesRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ResumeAI Node.js Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

const { spawn } = require('child_process');

function initFastAPIService() {
  const isLocal = !process.env.FASTAPI_URL ||
    process.env.FASTAPI_URL.includes('127.0.0.1') ||
    process.env.FASTAPI_URL.includes('localhost');

  if (!isLocal) {
    console.log(`📡 Using external FastAPI ML Service at: ${process.env.FASTAPI_URL}`);
    return;
  }

  const appDir = path.resolve(__dirname, '../../App');
  const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';

  console.log(`🐍 Starting embedded FastAPI ML engine from: ${appDir}...`);
  try {
    const mlProc = spawn(pythonCmd, ['-m', 'uvicorn', 'main:app', '--app-dir', appDir, '--host', '127.0.0.1', '--port', '8000'], {
      stdio: 'inherit',
    });

    mlProc.on('error', (err) => {
      console.warn(`⚠️ Embedded FastAPI launch notice: ${err.message}`);
    });

    mlProc.on('exit', (code, sig) => {
      console.log(`ℹ️ Embedded FastAPI process stopped (code: ${code}, sig: ${sig})`);
    });

    process.on('exit', () => {
      try { mlProc.kill(); } catch (e) {}
    });
  } catch (err) {
    console.warn(`⚠️ Could not spawn FastAPI process: ${err.message}`);
  }
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 ResumeAI Node.js API Gateway running on port ${PORT}`);
  console.log(`📡 Connected to FastAPI ML Service`);
  console.log(`====================================================`);
  initFastAPIService();
});

