import React, { useState } from 'react';
import { analyzerApi } from '../services/api';
import PipelineLoader from '../components/PipelineLoader';
import { Upload, X, AlertCircle, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadModal({ isOpen, onClose, onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a resume file (PDF or DOCX).');
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const data = new FormData();
      data.append('resume', selectedFile);

      const res = await analyzerApi.analyze(data);
      if (res.data.success) {
        onAnalysisComplete(res.data.data);
        onClose();
      } else {
        setErrorMessage(res.data.message || 'Analysis failed. Please try another file.');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error parsing resume file.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(23, 19, 19, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '28px', position: 'relative', boxShadow: 'var(--shadow-lg)' }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-dim)',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        <div style={{ marginBottom: '20px' }}>
          <span className="eyebrow">Instant Parsing</span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            Upload Your Resume
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Our NLP engine will extract skills, evaluate ATS completeness, classify your domain, and generate real-time recommendations.
          </p>
        </div>

        {errorMessage && (
          <div style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.25)', borderRadius: '8px', padding: '10px 14px', color: '#C0392B', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={15} />
            <span>{errorMessage}</span>
          </div>
        )}

        {isAnalyzing ? (
          <PipelineLoader />
        ) : (
          <form onSubmit={handleUpload}>
            <label className="dropzone" style={{ display: 'block', padding: '28px 16px', marginBottom: '20px' }}>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="dropzone-icon" style={{ width: '42px', height: '42px' }}>
                <Upload size={20} />
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                {selectedFile ? selectedFile.name : 'Click to select or drag PDF / DOCX'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                PDF or DOCX format (Max 15MB)
              </div>
            </label>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '9px 16px', fontSize: '0.84rem' }}
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '9px 20px', fontSize: '0.84rem' }}
                disabled={!selectedFile}
              >
                <Sparkles size={14} />
                <span>Analyze &amp; Update Dashboard</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
