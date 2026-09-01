import React, { useState, useEffect } from 'react';
import { analyzerApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import PipelineLoader from '../components/PipelineLoader';
import { useAuth } from '../context/AuthContext';
import {
  Upload, FileText, CheckCircle2, XCircle, Brain, Sparkles,
  BookOpen, TrendingUp, RotateCcw, Download, AlertCircle,
  ExternalLink, FileCheck, Target, FileEdit,
  Layers, Key, PlayCircle, Briefcase, Globe, Smartphone,
  Apple, Palette, Lightbulb, CheckSquare
} from 'lucide-react';

export default function Analyzer({ setActivePage }) {
  const { latestAnalysis, saveAnalysis } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // If resume is already analyzed (e.g. during sign up), show insights directly
  const [analysisData, setAnalysisData] = useState(latestAnalysis || null);
  const [activeTab, setActiveTab] = useState('checklist');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiTips, setAiTips] = useState(null);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);

  // Sync if latestAnalysis changes externally (e.g. uploaded from modal or signup)
  useEffect(() => {
    if (latestAnalysis && !analysisData) {
      setAnalysisData(latestAnalysis);
    }
  }, [latestAnalysis]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMessage('');
    }
  };

  const runAnalysis = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Please select a resume PDF or DOCX file to analyze.');
      return;
    }
    setErrorMessage('');
    setIsAnalyzing(true);
    try {
      const data = new FormData();
      data.append('resume', selectedFile);

      const res = await analyzerApi.analyze(data);
      if (res.data.success) {
        setAnalysisData(res.data.data);
        if (saveAnalysis) saveAnalysis(res.data.data);
      } else {
        setErrorMessage(res.data.message || 'Analysis failed.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Error occurred during resume analysis.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerateTips = async () => {
    if (!analysisData?.resume_text) return;
    setIsGeneratingTips(true);
    try {
      const res = await analyzerApi.getAiTips(analysisData.resume_text);
      if (res.data.success) setAiTips(res.data.categorized);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingTips(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setSelectedFile(null);
    setAiTips(null);
    setActiveTab('checklist');
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">Resume Intelligence</span>
        <h1 className="page-title">ATS Resume Analyzer</h1>
        <p className="page-subtitle">
          In-depth parsing and ATS compliance scoring for your resume across skills, sections, keyword density, and career domain intelligence.
        </p>
      </div>

      {errorMessage && (
        <div style={{
          background: 'rgba(192, 57, 43, 0.08)',
          border: '1px solid rgba(192, 57, 43, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#C0392B',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      {isAnalyzing ? (
        <PipelineLoader />
      ) : !analysisData ? (
        /* Upload Form (Personal info removed, clean dropzone) */
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
          <div className="card">
            <form onSubmit={runAnalysis}>
              <div className="sec-label">Upload Resume Document (PDF / DOCX) *</div>
              <label className="dropzone" style={{ display: 'block', padding: '44px 20px', marginBottom: '20px' }}>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div className="dropzone-icon" style={{ width: '52px', height: '52px' }}>
                  <Upload size={24} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>
                  {selectedFile ? selectedFile.name : 'Click or Drag & Drop Resume File'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  Supported formats: PDF, DOCX (Max 15MB)
                </div>
              </label>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '13px', fontSize: '0.92rem' }}
                disabled={!selectedFile}
              >
                <Sparkles size={16} />
                <span>Run Intelligent ATS Analysis</span>
              </button>
            </form>
          </div>

          <div>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="sec-label">
                <Lightbulb size={14} color="#8E3B46" />
                <span>ATS Optimization Best Practices</span>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <FileText size={18} color="#8E3B46" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <b style={{ color: 'var(--text-main)' }}>Single-column layout:</b> Standard single-column PDFs parse with over 98% accuracy in enterprise ATS systems.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                <FileCheck size={18} color="#8E3B46" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <b style={{ color: 'var(--text-main)' }}>Standard headings:</b> Use recognized section titles: Summary, Skills, Experience, Education, Projects.
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <ExternalLink size={18} color="#8E3B46" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  <b style={{ color: 'var(--text-main)' }}>Quantify achievements:</b> Use metrics (e.g. "Improved query performance by 40%") using the STAR method.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="sec-label">Supported Career Fields</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {[
                  { name: 'Data Science & AI', icon: <Briefcase size={14} /> },
                  { name: 'Web Development', icon: <Globe size={14} /> },
                  { name: 'Android Dev', icon: <Smartphone size={14} /> },
                  { name: 'iOS Development', icon: <Apple size={14} /> },
                  { name: 'UI/UX Design', icon: <Palette size={14} /> },
                  { name: 'Cloud & DevOps', icon: <Target size={14} /> },
                  { name: 'Cybersecurity', icon: <Key size={14} /> },
                  { name: 'Product Mgmt', icon: <Layers size={14} /> },
                ].map((d) => (
                  <div key={d.name} style={{
                    background: 'var(--bg-card-2)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.78rem',
                    color: 'var(--text-body)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: '500'
                  }}>
                    <span style={{ color: '#8E3B46' }}>{d.icon}</span>
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Results View (Shows immediately if resume already exists) */
        <div>
          {/* Header & KPI cards */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
                  {analysisData.parsed_name || 'Candidate Resume'}
                </h2>
                <span className={`pill ${analysisData.candidate_level === 'Experienced' ? 'pill-green' : analysisData.candidate_level === 'Intermediate' ? 'pill-amber' : 'pill-blue'}`}>
                  {analysisData.candidate_level}
                </span>
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                {analysisData.parsed_email || analysisData.act_mail || 'Email on file'} · {analysisData.parsed_mobile || analysisData.act_mob || 'Contact on file'}
              </div>
            </div>
            <button className="btn-secondary" onClick={resetAnalysis}>
              <RotateCcw size={15} />
              <span>Analyze Another Resume</span>
            </button>
          </div>

          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: '#8E3B46' }}>
                {analysisData.resume_score}
                <span style={{ fontSize: '1rem', color: 'var(--text-dim)', fontWeight: '400' }}>/100</span>
              </div>
              <div className="kpi-label">Overall ATS Health Score</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>
                {analysisData.predicted_field}
              </div>
              <div className="kpi-label">Predicted Career Domain</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val" style={{ color: 'var(--text-main)', fontSize: '1.3rem' }}>
                {analysisData.candidate_level}
              </div>
              <div className="kpi-label">Experience Tier ({analysisData.no_of_pages || 1} pg)</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="tab-header">
            {[
              { id: 'checklist', label: 'Score & Checklist', icon: <CheckSquare size={14} /> },
              { id: 'skills', label: 'Field & Skills', icon: <Target size={14} /> },
              { id: 'courses', label: 'Courses & Videos', icon: <BookOpen size={14} /> },
              { id: 'insights', label: 'Career Insights', icon: <TrendingUp size={14} /> },
              { id: 'coach', label: 'AI Career Coach', icon: <Sparkles size={14} /> },
              { id: 'preview', label: 'Resume Preview', icon: <FileText size={14} /> },
            ].map((tab) => (
              <button key={tab.id} className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Checklist */}
          {activeTab === 'checklist' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '2rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div className="sec-label" style={{ marginBottom: '20px' }}>Score Gauge</div>
                <ScoreGauge score={analysisData.resume_score} size={200} />
              </div>
              <div className="card">
                <div className="sec-label">
                  Section Checklist ({analysisData.checks_result?.filter((c) => c.found).length}/{analysisData.checks_result?.length} Detected)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {analysisData.checks_result?.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: item.found ? 'rgba(45, 106, 79, 0.04)' : 'rgba(192, 57, 43, 0.04)',
                      border: `1px solid ${item.found ? 'rgba(45, 106, 79, 0.18)' : 'rgba(192, 57, 43, 0.16)'}`
                    }}>
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

          {/* Tab 2: Skills & Field */}
          {activeTab === 'skills' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label">Domain Match Probabilities</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.entries(analysisData.domain_scores || {}).sort((a, b) => b[1] - a[1]).map(([dom, pct]) => {
                    const isActive = dom === analysisData.predicted_field;
                    return (
                      <div key={dom} style={{
                        padding: '12px 14px',
                        background: isActive ? 'var(--bg-card-2)' : 'transparent',
                        border: `1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}`,
                        borderRadius: '8px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isActive ? 'var(--primary)' : 'var(--text-main)' }}>{dom}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{pct}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: isActive ? 'var(--primary)' : 'var(--border-strong)', borderRadius: '99px' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="card" style={{ marginBottom: '20px' }}>
                  <div className="sec-label">Extracted Skills ({analysisData.detected_skills?.length || 0})</div>
                  {analysisData.detected_skills?.length > 0 ? (
                    <div className="chip-wrap">
                      {analysisData.detected_skills.map((s, idx) => <span key={idx} className="chip-p">{s}</span>)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No skills detected on resume.</div>
                  )}
                </div>
                <div className="card">
                  <div className="sec-label">Recommended Target Skills to Add</div>
                  {analysisData.recommended_skills?.length > 0 ? (
                    <div className="chip-wrap">
                      {analysisData.recommended_skills.map((s, idx) => <span key={idx} className="chip-g">{s}</span>)}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Profile has strong coverage.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Courses & Videos */}
          {activeTab === 'courses' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
              <div className="card">
                <div className="sec-label">
                  <BookOpen size={14} color="#8E3B46" />
                  <span>Curated {analysisData.predicted_field} Courses</span>
                </div>
                {analysisData.recommended_courses?.length > 0 ? (
                  analysisData.recommended_courses.map(([title, url], idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="course-item">
                      <div className="course-badge">{idx + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.86rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>{title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                          {url.includes('coursera') ? 'Coursera' : url.includes('udacity') ? 'Udacity' : url.includes('udemy') ? 'Udemy' : 'Online'}
                        </div>
                      </div>
                      <ExternalLink size={15} color="#8E3B46" />
                    </a>
                  ))
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>No specific course tracks found.</div>
                )}
              </div>

              <div className="card">
                <div className="sec-label">
                  <PlayCircle size={14} color="#8E3B46" />
                  <span>Recommended Coaching Videos</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {analysisData.recommended_videos?.resume?.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="course-item">
                      <div style={{ width: '28px', height: '22px', background: '#8E3B46', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <PlayCircle size={13} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>Resume Writing Masterclass · YouTube</div>
                    </a>
                  ))}
                  {analysisData.recommended_videos?.interview?.map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noreferrer" className="course-item">
                      <div style={{ width: '28px', height: '22px', background: '#2D6A4F', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <PlayCircle size={13} />
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-body)' }}>Technical Interview Prep · YouTube</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Insights */}
          {activeTab === 'insights' && (
            <div>
              <div className="card" style={{ marginBottom: '24px' }}>
                <div className="sec-label">Market Intelligence for {analysisData.predicted_field}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '14px' }}>
                  <div className="kpi-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>Market Demand</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#2D6A4F' }}>{analysisData.insights?.demand || 'High'}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>Average Salary (India)</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#8E3B46' }}>{analysisData.insights?.avg_salary || '12 - 24 LPA'}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>Industry Growth</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#A07840' }}>{analysisData.insights?.growth || '+22% YoY'}</div>
                  </div>
                  <div className="kpi-card" style={{ padding: '16px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: '700' }}>In-Demand Core Stack</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-body)' }}>{analysisData.insights?.top_skills?.join(' · ') || 'Python · SQL · Cloud'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: AI Coach Tips */}
          {activeTab === 'coach' && (
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Brain size={18} color="#8E3B46" />
                      <span>AI Career Coach (Groq Llama 3.3 70B)</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Generates 6 targeted, personalized recommendations across Content, Structure, and Keywords.
                    </div>
                  </div>
                  <button className="btn-primary" onClick={handleGenerateTips} disabled={isGeneratingTips}>
                    <Sparkles size={15} />
                    <span>{isGeneratingTips ? 'Analyzing with AI...' : 'Generate AI Coaching Tips'}</span>
                  </button>
                </div>
              </div>

              {aiTips ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div className="card" style={{ borderLeft: '3px solid #8E3B46' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#8E3B46', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileEdit size={15} /><span>Content Enhancements</span>
                    </div>
                    {aiTips.Content?.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: '1.55', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>• {t}</div>
                    ))}
                  </div>
                  <div className="card" style={{ borderLeft: '3px solid #A07840' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#A07840', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={15} /><span>Structure &amp; Flow</span>
                    </div>
                    {aiTips.Structure?.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: '1.55', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>• {t}</div>
                    ))}
                  </div>
                  <div className="card" style={{ borderLeft: '3px solid #2D6A4F' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Key size={15} /><span>Keyword Alignment</span>
                    </div>
                    {aiTips.Keywords?.map((t, idx) => (
                      <div key={idx} style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: '1.55', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>• {t}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <Brain size={36} color="#8E3B46" style={{ margin: '0 auto 12px auto' }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>No AI coaching tips generated yet</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                    Click "Generate AI Coaching Tips" above to receive tailored feedback on your resume's bullet points and structure.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 6: Preview */}
          {activeTab === 'preview' && (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="sec-label" style={{ margin: 0 }}>Resume Preview</div>
                {analysisData.pdf_base64 && (
                  <a href={`data:application/pdf;base64,${analysisData.pdf_base64}`} download={analysisData.pdf_name || 'resume.pdf'} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
                    <Download size={14} />
                    <span>Download Stored PDF</span>
                  </a>
                )}
              </div>
              {analysisData.pdf_base64 ? (
                <iframe src={`data:application/pdf;base64,${analysisData.pdf_base64}`} width="100%" height="750" style={{ border: '1px solid var(--border)', borderRadius: '8px', background: '#fff' }} title="Resume PDF Preview" />
              ) : (
                <div style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.83rem', color: 'var(--text-body)', maxHeight: '500px', overflowY: 'auto' }}>
                  {analysisData.resume_text || 'No raw text preview available.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
