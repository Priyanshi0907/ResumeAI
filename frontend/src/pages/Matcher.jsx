import React, { useState } from 'react';
import { matcherApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import { useAuth } from '../context/AuthContext';
import {
  Target, Upload, FileText, Sparkles, CheckCircle2, XCircle,
  Download, RotateCcw, AlertCircle, FileDown, Split, FileEdit,
  Mail, AlertTriangle, Layers, LayoutTemplate
} from 'lucide-react';

export default function Matcher({ setActivePage }) {
  const { user, latestAnalysis } = useAuth();
  const [candidateName, setCandidateName] = useState(latestAnalysis?.parsed_name || user?.name || '');
  const [resumeText, setResumeText] = useState(latestAnalysis?.resume_text || '');
  const [jdText, setJdText] = useState('');
  const [selectedResumeFile, setSelectedResumeFile] = useState(null);

  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [activeTab, setActiveTab] = useState('score');
  const [errorMessage, setErrorMessage] = useState('');

  // Tailored contents
  const [tailoredResume, setTailoredResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('modern_single');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleResumeFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedResumeFile(file);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') setResumeText(content);
    };
    reader.readAsText(file);
  };

  const runJobMatch = async (e) => {
    e.preventDefault();
    if (!resumeText.trim() || !jdText.trim()) {
      setErrorMessage('Please provide both your Resume text and the Job Description.');
      return;
    }
    setErrorMessage('');
    setIsMatching(true);
    try {
      const res = await matcherApi.match({
        resume_text: resumeText,
        jd_text: jdText,
        name: candidateName || 'Candidate',
      });
      if (res.data.success) {
        setMatchResult(res.data);
        setIsTailoring(true);
        try {
          const [tailorRes, coverRes] = await Promise.all([
            matcherApi.tailor({ resume_text: resumeText, jd_text: jdText, name: candidateName || 'Candidate', missing_keywords: res.data.missing_keywords || [] }),
            matcherApi.coverLetter({ resume_text: resumeText, jd_text: jdText, name: candidateName || 'Candidate' }),
          ]);
          if (tailorRes.data.success) setTailoredResume(tailorRes.data.tailored_resume);
          if (coverRes.data.success) setCoverLetter(coverRes.data.cover_letter);
        } catch (genErr) {
          console.error('Tailor generation notice:', genErr);
        } finally {
          setIsTailoring(false);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || 'Error occurred during job matching.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!tailoredResume) return;
    setIsDownloadingPdf(true);
    try {
      const res = await matcherApi.exportPdf({ resume_text: tailoredResume, template: selectedTemplate, name: candidateName || 'Candidate Name' });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tailored_resume_${selectedTemplate}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please check server logs.');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadCoverLetter = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cover_letter.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const resetMatcher = () => {
    setMatchResult(null);
    setTailoredResume('');
    setCoverLetter('');
    setActiveTab('score');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">Targeted Optimization</span>
        <h1 className="page-title">Job Matcher &amp; Resume Tailor</h1>
        <p className="page-subtitle">
          Compare your resume against any job description to calculate exact ATS keyword alignment, identify missing requirements, and generate tailored STAR-format applications.
        </p>
      </div>

      {errorMessage && (
        <div style={{ background: 'rgba(192, 57, 43, 0.08)', border: '1px solid rgba(192, 57, 43, 0.25)', borderRadius: '8px', padding: '12px 16px', color: '#C0392B', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {!matchResult ? (
        /* Inputs Form */
        <div className="card">
          <form onSubmit={runJobMatch}>
            <div className="form-group" style={{ maxWidth: '400px', marginBottom: '20px' }}>
              <label className="form-label">Candidate Name</label>
              <input type="text" className="form-input" placeholder="Priya Sharma" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <div className="sec-label">1. Master Resume Content *</div>
                {latestAnalysis?.resume_text && resumeText && (
                  <div style={{ fontSize: '0.76rem', color: '#2D6A4F', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} />
                    <span>Pre-filled from your last analysis</span>
                  </div>
                )}
                <textarea
                  className="form-textarea"
                  style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder="Paste your full resume text here (Summary, Skills, Experience, Education, Projects)..."
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </div>

              <div>
                <div className="sec-label">2. Target Job Description *</div>
                <textarea
                  className="form-textarea"
                  style={{ height: '240px', fontFamily: 'monospace', fontSize: '0.82rem' }}
                  placeholder="Paste the job requirements, responsibilities, required skills, and qualifications..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', marginTop: '24px', padding: '12px' }}
              disabled={isMatching || !resumeText.trim() || !jdText.trim()}
            >
              <Target size={16} />
              <span>{isMatching ? 'Running Semantic Match...' : 'Compare & Tailor Resume'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* Results View */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
                {candidateName || 'Candidate Match Assessment'}
              </h2>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>Job Description Match &amp; Application Optimization</div>
            </div>
            <button className="btn-secondary" onClick={resetMatcher}>
              <RotateCcw size={15} />
              <span>New Job Match</span>
            </button>
          </div>

          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#8E3B46' }}>{matchResult.match_score}%</div>
              <div className="kpi-label">Job Description Match Score</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#2D6A4F' }}>{matchResult.matched_keywords?.length || 0}</div>
              <div className="kpi-label">Target Keywords Matched</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#C0392B' }}>{matchResult.missing_keywords?.length || 0}</div>
              <div className="kpi-label">Missing Keywords to Add</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tab-header">
            {[
              { id: 'score', label: 'ATS & Match Score', icon: <CheckCircle2 size={14} /> },
              { id: 'keywords', label: 'Keyword Gap Analysis', icon: <Split size={14} /> },
              { id: 'tailor', label: 'Tailored Resume Text', icon: <FileEdit size={14} /> },
              { id: 'letter', label: 'Tailored Cover Letter', icon: <Mail size={14} /> },
              { id: 'export', label: 'Export PDF', icon: <Download size={14} /> },
            ].map((tab) => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: ATS Score */}
          {activeTab === 'score' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="sec-label" style={{ marginBottom: '16px' }}>ATS Match Rating</div>
                <ScoreGauge score={matchResult.match_score} size={200} label="Job Match Score" />
              </div>
              <div className="card">
                <div className="sec-label">Section Checklist ({matchResult.ats_score}/100)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {matchResult.ats_checks?.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: item.found ? 'rgba(45, 106, 79, 0.04)' : 'rgba(192, 57, 43, 0.04)', border: `1px solid ${item.found ? 'rgba(45, 106, 79, 0.18)' : 'rgba(192, 57, 43, 0.16)'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.found ? <CheckCircle2 size={17} color="#2D6A4F" /> : <XCircle size={17} color="#C0392B" />}
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: item.found ? 'var(--text-main)' : '#C0392B' }}>{item.label}</span>
                      </div>
                      <span style={{ fontSize: '0.78rem', color: item.found ? '#2D6A4F' : 'var(--text-dim)', fontWeight: '600' }}>
                        {item.found ? `+${item.points} pts` : `Missing (${item.points} pts)`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Keyword Diff */}
          {activeTab === 'keywords' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} color="#2D6A4F" />
                  <span>Matched Keywords ({matchResult.matched_keywords?.length || 0})</span>
                </div>
                {matchResult.matched_keywords?.length > 0 ? (
                  <div className="chip-wrap">
                    {matchResult.matched_keywords.map((k, idx) => <span key={idx} className="chip-g">{k}</span>)}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No matching keywords detected.</div>
                )}
              </div>
              <div className="card">
                <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={15} color="#A07840" />
                  <span>Missing Keywords ({matchResult.missing_keywords?.length || 0})</span>
                </div>
                {matchResult.missing_keywords?.length > 0 ? (
                  <div className="chip-wrap">
                    {matchResult.missing_keywords.map((k, idx) => <span key={idx} className="chip-p">{k}</span>)}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: '#2D6A4F', fontWeight: '600' }}>Outstanding! All target keywords matched.</div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Tailored Resume Text */}
          {activeTab === 'tailor' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="sec-label" style={{ margin: 0 }}>STAR-Method Tailored Resume (Editable)</div>
                {isTailoring && <span style={{ fontSize: '0.78rem', color: '#8E3B46' }}>Generating tailored resume...</span>}
              </div>
              <textarea
                className="form-textarea"
                style={{ height: '450px', fontFamily: 'monospace', fontSize: '0.84rem', lineHeight: '1.6' }}
                value={tailoredResume}
                onChange={(e) => setTailoredResume(e.target.value)}
                placeholder="AI-generated tailored resume text will appear here..."
              />
            </div>
          )}

          {/* Tab 4: Cover Letter */}
          {activeTab === 'letter' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div className="sec-label" style={{ margin: 0 }}>Tailored Cover Letter (Editable)</div>
                <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleDownloadCoverLetter}>
                  <Download size={13} /><span>Download .txt</span>
                </button>
              </div>
              <textarea
                className="form-textarea"
                style={{ height: '380px', fontSize: '0.88rem', lineHeight: '1.7' }}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="AI-generated cover letter will appear here..."
              />
            </div>
          )}

          {/* Tab 5: Export PDF */}
          {activeTab === 'export' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label">Select Layout Design Template</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: selectedTemplate === 'modern_single' ? 'var(--primary-soft)' : 'var(--bg-card-2)', border: `1px solid ${selectedTemplate === 'modern_single' ? 'var(--primary)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tpl" value="modern_single" checked={selectedTemplate === 'modern_single'} onChange={() => setSelectedTemplate('modern_single')} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Modern Single Column</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean Helvetica sans-serif with subtle typography for Tech &amp; Startups.</div>
                    </div>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', background: selectedTemplate === 'classic_single' ? 'rgba(160, 120, 64, 0.08)' : 'var(--bg-card-2)', border: `1px solid ${selectedTemplate === 'classic_single' ? 'var(--accent-gold)' : 'var(--border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                    <input type="radio" name="tpl" value="classic_single" checked={selectedTemplate === 'classic_single'} onChange={() => setSelectedTemplate('classic_single')} />
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>Classic Single Column</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Traditional Times-Roman serif typography for Finance, Consulting, and Corporate.</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '36px 24px' }}>
                <FileDown size={44} color="#8E3B46" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>Generate ReportLab PDF</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '320px', marginBottom: '24px' }}>
                  Compiles the tailored resume text into a publication-quality ATS-compatible PDF file.
                </p>
                <button className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.92rem' }} onClick={handleDownloadPdf} disabled={isDownloadingPdf || !tailoredResume}>
                  <Download size={15} />
                  <span>{isDownloadingPdf ? 'Compiling PDF...' : 'Download Tailored PDF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
