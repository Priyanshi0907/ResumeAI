import React, { useState, useEffect } from 'react';
import { analyzerApi } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';
import PipelineLoader from '../components/PipelineLoader';
import SectionChecklist from '../components/SectionChecklist';
import { useAuth } from '../context/AuthContext';
import {
  Upload, FileText, CheckCircle2, XCircle, Brain, Sparkles,
  BookOpen, TrendingUp, RotateCcw, Download, AlertCircle,
  ExternalLink, FileCheck, Target, FileEdit,
  Layers, Key, PlayCircle, Briefcase, Globe, Smartphone,
  Apple, Palette, Lightbulb, CheckSquare, BarChart3, DollarSign,
  MapPin, Activity, Award, Zap, ArrowUpRight, Clock
} from 'lucide-react';

// Comprehensive domain market intelligence and graphic visualization data
const DOMAIN_MARKET_BENCHMARKS = {
  "Data Science & AI": {
    growthRate: "+28% YoY",
    cagr: "24.6%",
    openPositions: "48,500+ active openings",
    avgSalaryRange: "₹10 - 28 LPA",
    salaryTiers: [
      { level: "Entry-Level (0-2 YOE)", range: "₹6 - 12 LPA", min: 6, max: 12, median: 9 },
      { level: "Mid-Level (3-5 YOE)", range: "₹14 - 24 LPA", min: 14, max: 24, median: 19 },
      { level: "Senior (5-8 YOE)", range: "₹26 - 42 LPA", min: 26, max: 42, median: 34 },
      { level: "Lead / Architect (8+ YOE)", range: "₹45 - 75+ LPA", min: 45, max: 75, median: 58 }
    ],
    skillsBenchmark: [
      { name: "Python", demand: 96, category: "Languages" },
      { name: "PyTorch / TensorFlow", demand: 91, category: "Deep Learning" },
      { name: "SQL & Data Modeling", demand: 88, category: "Data Pipelines" },
      { name: "MLOps & Docker", demand: 82, category: "Infrastructure" },
      { name: "Cloud (AWS / Azure)", demand: 79, category: "Cloud" },
      { name: "GenAI / LLMs & RAG", demand: 89, category: "Emerging Tech" }
    ],
    hubs: [
      { city: "Bengaluru", pct: 40, salary: "₹22 LPA" },
      { city: "Hyderabad", pct: 24, salary: "₹19 LPA" },
      { city: "Pune & Mumbai", pct: 18, salary: "₹18 LPA" },
      { city: "Delhi-NCR", pct: 12, salary: "₹17 LPA" },
      { city: "Remote / Hybrid", pct: 6, salary: "$110k+" }
    ],
    trendYears: ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"],
    trendValues: [46, 56, 65, 75, 84, 94],
    careerRoadmap: [
      { role: "Data Analyst / Junior Scientist", timeframe: "Years 0-2", focus: "Exploratory analysis, SQL pipelines, baseline Scikit-Learn models." },
      { role: "Machine Learning Engineer", timeframe: "Years 2-4", focus: "End-to-end model training, experiment tracking, API deployment." },
      { role: "Senior AI Specialist", timeframe: "Years 4-7", focus: "Distributed training, custom architectures, MLOps, cross-team technical leadership." },
      { role: "Staff Scientist / AI Director", timeframe: "Years 7+", focus: "Strategic AI roadmapping, multi-modal systems, patent & enterprise architecture." }
    ]
  },
  "Full Stack Web Development": {
    growthRate: "+22% YoY",
    cagr: "19.8%",
    openPositions: "62,000+ active openings",
    avgSalaryRange: "₹8 - 24 LPA",
    salaryTiers: [
      { level: "Entry-Level (0-2 YOE)", range: "₹5 - 10 LPA", min: 5, max: 10, median: 7.5 },
      { level: "Mid-Level (3-5 YOE)", range: "₹12 - 22 LPA", min: 12, max: 22, median: 17 },
      { level: "Senior (5-8 YOE)", range: "₹24 - 38 LPA", min: 24, max: 38, median: 30 },
      { level: "Lead / Architect (8+ YOE)", range: "₹40 - 65+ LPA", min: 40, max: 65, median: 52 }
    ],
    skillsBenchmark: [
      { name: "React & Next.js", demand: 95, category: "Frontend" },
      { name: "TypeScript / JavaScript", demand: 93, category: "Languages" },
      { name: "Node.js & Express", demand: 89, category: "Backend" },
      { name: "PostgreSQL & MongoDB", demand: 86, category: "Databases" },
      { name: "Docker & CI/CD", demand: 81, category: "DevOps" },
      { name: "GraphQL & REST APIs", demand: 78, category: "API Design" }
    ],
    hubs: [
      { city: "Bengaluru", pct: 42, salary: "₹20 LPA" },
      { city: "Delhi-NCR", pct: 20, salary: "₹18 LPA" },
      { city: "Hyderabad", pct: 18, salary: "₹17.5 LPA" },
      { city: "Pune", pct: 12, salary: "₹16 LPA" },
      { city: "Remote / Global", pct: 8, salary: "$95k+" }
    ],
    trendYears: ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"],
    trendValues: [52, 60, 68, 76, 83, 91],
    careerRoadmap: [
      { role: "Junior Frontend/Backend Dev", timeframe: "Years 0-2", focus: "Component lifecycles, REST consumption, CSS/HTML, Git collaboration." },
      { role: "Full Stack Engineer", timeframe: "Years 2-4", focus: "End-to-end full stack features, database schema design, state management, testing." },
      { role: "Senior Full Stack Architect", timeframe: "Years 4-7", focus: "Micro-frontends, high-throughput backend services, caching layers, architecture design." },
      { role: "Principal Engineer / CTO", timeframe: "Years 7+", focus: "System resiliency, tech stack selection, technical strategy across product lines." }
    ]
  },
  "Software Engineering": {
    growthRate: "+20% YoY",
    cagr: "18.2%",
    openPositions: "55,000+ active openings",
    avgSalaryRange: "₹10 - 30 LPA",
    salaryTiers: [
      { level: "Entry-Level (0-2 YOE)", range: "₹6 - 12 LPA", min: 6, max: 12, median: 9 },
      { level: "Mid-Level (3-5 YOE)", range: "₹15 - 26 LPA", min: 15, max: 26, median: 20 },
      { level: "Senior (5-8 YOE)", range: "₹28 - 45 LPA", min: 28, max: 45, median: 36 },
      { level: "Staff / Principal (8+ YOE)", range: "₹48 - 80+ LPA", min: 48, max: 80, median: 62 }
    ],
    skillsBenchmark: [
      { name: "Java / C++ / Go", demand: 94, category: "Core Languages" },
      { name: "System Design & Distributed Systems", demand: 92, category: "Architecture" },
      { name: "Data Structures & Algorithms", demand: 90, category: "CS Fundamentals" },
      { name: "Microservices & gRPC/REST", demand: 87, category: "Backend" },
      { name: "Databases (SQL/NoSQL)", demand: 85, category: "Data Storage" },
      { name: "CI/CD & Automated Testing", demand: 80, category: "Quality & Delivery" }
    ],
    hubs: [
      { city: "Bengaluru", pct: 44, salary: "₹24 LPA" },
      { city: "Hyderabad", pct: 25, salary: "₹21 LPA" },
      { city: "Pune", pct: 15, salary: "₹18 LPA" },
      { city: "Delhi-NCR", pct: 11, salary: "₹18 LPA" },
      { city: "Remote", pct: 5, salary: "$120k+" }
    ],
    trendYears: ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"],
    trendValues: [50, 58, 66, 74, 82, 90],
    careerRoadmap: [
      { role: "Software Engineer I", timeframe: "Years 0-2", focus: "Bug resolution, module implementation, code reviews, unit testing." },
      { role: "Software Engineer II", timeframe: "Years 2-5", focus: "Ownership of services, low-level design, latency tuning, multithreading." },
      { role: "Senior Software Engineer", timeframe: "Years 5-8", focus: "High-level system design, fault tolerance, cross-team initiatives, technical mentoring." },
      { role: "Principal Engineer / Architect", timeframe: "Years 8+", focus: "Enterprise-wide technical vision, mission-critical infrastructure, 5-nines reliability." }
    ]
  },
  "Cloud & DevOps Engineering": {
    growthRate: "+32% YoY",
    cagr: "27.5%",
    openPositions: "38,000+ active openings",
    avgSalaryRange: "₹12 - 32 LPA",
    salaryTiers: [
      { level: "Entry-Level (0-2 YOE)", range: "₹6 - 12 LPA", min: 6, max: 12, median: 9 },
      { level: "Mid-Level (3-5 YOE)", range: "₹16 - 28 LPA", min: 16, max: 28, median: 22 },
      { level: "Senior (5-8 YOE)", range: "₹28 - 48 LPA", min: 28, max: 48, median: 38 },
      { level: "Lead Cloud Architect (8+ YOE)", range: "₹50 - 85+ LPA", min: 50, max: 85, median: 65 }
    ],
    skillsBenchmark: [
      { name: "Kubernetes & Helm", demand: 97, category: "Orchestration" },
      { name: "Terraform & IaC", demand: 93, category: "Automation" },
      { name: "AWS / Azure / GCP", demand: 92, category: "Cloud Providers" },
      { name: "Docker Containerization", demand: 89, category: "Containers" },
      { name: "CI/CD (GitHub Actions/Jenkins)", demand: 86, category: "Pipelines" },
      { name: "Prometheus & Grafana", demand: 82, category: "Observability" }
    ],
    hubs: [
      { city: "Bengaluru", pct: 39, salary: "₹23 LPA" },
      { city: "Hyderabad", pct: 26, salary: "₹20 LPA" },
      { city: "Pune", pct: 16, salary: "₹19 LPA" },
      { city: "Chennai", pct: 11, salary: "₹17 LPA" },
      { city: "Remote", pct: 8, salary: "$130k+" }
    ],
    trendYears: ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"],
    trendValues: [42, 53, 64, 76, 86, 96],
    careerRoadmap: [
      { role: "Junior DevOps / Cloud Admin", timeframe: "Years 0-2", focus: "Basic container builds, Linux scripting, cloud resource provisioning, monitoring." },
      { role: "DevOps Engineer / SRE", timeframe: "Years 2-4", focus: "Kubernetes cluster configuration, CI/CD pipeline automation, SLA/SLO tracking." },
      { role: "Senior SRE / Cloud Architect", timeframe: "Years 4-7", focus: "Multi-region disaster recovery, Terraform modules, security compliance, zero-downtime." },
      { role: "Head of Infrastructure / Platform VP", timeframe: "Years 7+", focus: "Global platform strategy, cloud spend optimization, enterprise reliability engineering." }
    ]
  },
  "UI/UX Design & Research": {
    growthRate: "+24% YoY",
    cagr: "21.0%",
    openPositions: "25,000+ active openings",
    avgSalaryRange: "₹8 - 22 LPA",
    salaryTiers: [
      { level: "Entry-Level (0-2 YOE)", range: "₹5 - 10 LPA", min: 5, max: 10, median: 7.5 },
      { level: "Mid-Level (3-5 YOE)", range: "₹12 - 20 LPA", min: 12, max: 20, median: 16 },
      { level: "Senior (5-8 YOE)", range: "₹22 - 36 LPA", min: 22, max: 36, median: 29 },
      { level: "Lead Designer / Director (8+ YOE)", range: "₹38 - 60+ LPA", min: 38, max: 60, median: 48 }
    ],
    skillsBenchmark: [
      { name: "Figma & Auto-layout", demand: 98, category: "UI Design" },
      { name: "Design Systems & Tokens", demand: 94, category: "Design Architecture" },
      { name: "Wireframing & Prototyping", demand: 90, category: "Interaction" },
      { name: "User Research & Usability", demand: 86, category: "Research" },
      { name: "Micro-interactions & Motion", demand: 80, category: "Visual Design" },
      { name: "Accessibility (WCAG)", demand: 76, category: "Compliance" }
    ],
    hubs: [
      { city: "Bengaluru", pct: 45, salary: "₹21 LPA" },
      { city: "Delhi-NCR", pct: 22, salary: "₹18 LPA" },
      { city: "Mumbai", pct: 18, salary: "₹18 LPA" },
      { city: "Pune", pct: 9, salary: "₹15 LPA" },
      { city: "Remote", pct: 6, salary: "$90k+" }
    ],
    trendYears: ["2021", "2022", "2023", "2024", "2025", "2026 (Est.)"],
    trendValues: [48, 57, 66, 75, 83, 92],
    careerRoadmap: [
      { role: "Junior UI/UX Designer", timeframe: "Years 0-2", focus: "Component layout, mockups, icon sets, responsive screen variants." },
      { role: "Product Designer", timeframe: "Years 2-4", focus: "End-to-end product flows, user testing, design token maintenance, developer handoff." },
      { role: "Senior Product Designer", timeframe: "Years 4-7", focus: "Design system leadership, complex interaction models, business KPI alignment." },
      { role: "Design Director / VP of Product Design", timeframe: "Years 7+", focus: "Brand experience direction, design culture, multi-platform design strategy." }
    ]
  }
};

export default function Analyzer({ setActivePage }) {
  const { latestAnalysis, saveAnalysis, removeAnalysis } = useAuth();
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // If resume is already analyzed (e.g. during sign up), show insights directly
  const [analysisData, setAnalysisData] = useState(latestAnalysis || null);
  const [activeTab, setActiveTab] = useState('checklist');
  const [errorMessage, setErrorMessage] = useState('');
  const [aiTips, setAiTips] = useState(null);
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);

  // Sync if latestAnalysis changes externally (e.g. uploaded from modal or removed)
  useEffect(() => {
    setAnalysisData(latestAnalysis || null);
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
    if (window.confirm('Do you want to remove the current resume and analyze another one?')) {
      if (removeAnalysis) removeAnalysis();
      setAnalysisData(null);
      setSelectedFile(null);
      setAiTips(null);
      setActiveTab('checklist');
    }
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
                <SectionChecklist
                  resumeText={analysisData.resume_text}
                  checksResult={analysisData.checks_result}
                  initialPersonalInfo={analysisData}
                  title="Section Checklist"
                />
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
          {activeTab === 'insights' && (() => {
            const domainKey = analysisData.predicted_field || 'Data Science & AI';
            const benchmark = DOMAIN_MARKET_BENCHMARKS[domainKey] || DOMAIN_MARKET_BENCHMARKS['Data Science & AI'];
            const detectedSkillsLower = (analysisData.detected_skills || []).map((s) => s.toLowerCase());

            // Trend chart calculation
            const chartW = 560;
            const chartH = 160;
            const padL = 40;
            const padR = 25;
            const padT = 20;
            const padB = 30;
            const plotW = chartW - padL - padR;
            const plotH = chartH - padT - padB;

            const trendValues = benchmark.trendValues;
            const trendYears = benchmark.trendYears;
            const minV = 30;
            const maxV = 100;

            const trendPoints = trendValues.map((val, i) => {
              const x = padL + (i / (trendValues.length - 1)) * plotW;
              const y = padT + plotH - ((val - minV) / (maxV - minV)) * plotH;
              return { x, y, val, year: trendYears[i] };
            });

            const lineD = trendPoints.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`), '');
            const areaD = `${lineD} L ${trendPoints[trendPoints.length - 1].x},${padT + plotH} L ${trendPoints[0].x},${padT + plotH} Z`;

            // Skill readiness calculation
            const verifiedSkillsCount = benchmark.skillsBenchmark.filter((item) =>
              detectedSkillsLower.some((ds) => ds.includes(item.name.toLowerCase().split(' ')[0]) || item.name.toLowerCase().includes(ds))
            ).length;
            const readinessPct = Math.round((verifiedSkillsCount / benchmark.skillsBenchmark.length) * 100);

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                {/* 1. Header & KPI Summary Row */}
                <div className="card" style={{ padding: '22px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          background: 'var(--primary-soft)',
                          color: 'var(--primary)',
                          fontWeight: '800',
                          fontSize: '0.72rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase'
                        }}>
                          Live Market Intelligence
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#2D6A4F', fontWeight: '700' }}>
                          • {benchmark.openPositions}
                        </span>
                      </div>
                      <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                        {domainKey} Market Analytics
                      </h2>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'var(--bg-card-2)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      fontSize: '0.76rem',
                      fontWeight: '600',
                      color: 'var(--text-muted)'
                    }}>
                      <Activity size={13} color="#2D6A4F" />
                      <span>Updated for Current 2026 Hiring Cycle</span>
                    </div>
                  </div>

                  {/* 4 Graphic KPI Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                    <div className="kpi-card" style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Market Demand
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#2D6A4F', background: 'rgba(45, 106, 79, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Top Tier
                        </span>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{analysisData.insights?.demand || 'Very High'}</span>
                        <TrendingUp size={18} />
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Index: <b>94 / 100</b> demand pressure
                      </div>
                    </div>

                    <div className="kpi-card" style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Annual Compensation
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#8E3B46', background: 'var(--primary-soft)', padding: '2px 6px', borderRadius: '4px' }}>
                          India Tier 1
                        </span>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#8E3B46' }}>
                        {analysisData.insights?.avg_salary || benchmark.avgSalaryRange}
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Median: <b>₹18.5 LPA</b> · Global: <b>$110k+</b>
                      </div>
                    </div>

                    <div className="kpi-card" style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Industry Growth
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#A07840', background: 'rgba(160, 120, 64, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          CAGR {benchmark.cagr}
                        </span>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#A07840', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{analysisData.insights?.growth || benchmark.growthRate}</span>
                        <ArrowUpRight size={18} />
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        5-year hiring surge trajectory
                      </div>
                    </div>

                    <div className="kpi-card" style={{ padding: '16px 18px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                          Your Stack Alignment
                        </span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: readinessPct >= 65 ? '#2D6A4F' : '#A07840', background: readinessPct >= 65 ? 'rgba(45, 106, 79, 0.1)' : 'rgba(160, 120, 64, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          {verifiedSkillsCount}/{benchmark.skillsBenchmark.length} Verified
                        </span>
                      </div>
                      <div style={{ fontSize: '1.35rem', fontWeight: '900', color: readinessPct >= 65 ? '#2D6A4F' : '#A07840' }}>
                        {readinessPct}% Match
                      </div>
                      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Core market competencies
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Visualizations Grid Row 1: SVG Hiring Demand Curve + Salary Progression */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                  {/* Chart 1: SVG Hiring Demand Curve */}
                  <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div className="sec-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <TrendingUp size={14} color="#8E3B46" />
                            <span>6-Year Industry Hiring Demand Curve</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Index growth based on global &amp; Indian enterprise tech headcount demand (2021–2026)
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2D6A4F', background: 'rgba(45, 106, 79, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                          +104% vs 2021
                        </span>
                      </div>

                      {/* Pure SVG Line & Area Chart */}
                      <div style={{ background: 'var(--bg-card-2)', borderRadius: '10px', padding: '16px 12px 10px 12px', border: '1px solid var(--border)' }}>
                        <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}>
                          <defs>
                            <linearGradient id="careerAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8E3B46" stopOpacity="0.32" />
                              <stop offset="90%" stopColor="#8E3B46" stopOpacity="0.02" />
                            </linearGradient>
                          </defs>

                          {/* Horizontal Grid lines */}
                          {[100, 75, 50].map((v) => {
                            const y = padT + plotH - ((v - minV) / (maxV - minV)) * plotH;
                            return (
                              <g key={v}>
                                <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke="var(--border)" strokeDasharray="3 3" strokeWidth="1" />
                                <text x={padL - 8} y={y + 3} textAnchor="end" fontSize="9" fill="var(--text-dim)" fontFamily="sans-serif">
                                  {v}
                                </text>
                              </g>
                            );
                          })}

                          {/* Area Fill */}
                          <path d={areaD} fill="url(#careerAreaGrad)" />

                          {/* Line Stroke */}
                          <path d={lineD} fill="none" stroke="#8E3B46" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

                          {/* Data points & Values */}
                          {trendPoints.map((pt, i) => (
                            <g key={i}>
                              <circle cx={pt.x} cy={pt.y} r="4.5" fill="#8E3B46" stroke="#FFFFFF" strokeWidth="2" />
                              <text x={pt.x} y={pt.y - 8} textAnchor="middle" fontSize="9.5" fontWeight="800" fill="#8E3B46" fontFamily="sans-serif">
                                {pt.val}
                              </text>
                              {/* X Axis Year Label */}
                              <text x={pt.x} y={padT + plotH + 18} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--text-muted)" fontFamily="sans-serif">
                                {pt.year}
                              </text>
                            </g>
                          ))}
                        </svg>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                      <span>Hiring Momentum: <b style={{ color: '#2D6A4F' }}>Aggressive Acceleration</b></span>
                      <span>Peak Qtr: <b style={{ color: 'var(--text-main)' }}>Q3 &amp; Q4 Annual Cycles</b></span>
                    </div>
                  </div>

                  {/* Chart 2: Salary Progression Tiers by Experience */}
                  <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div className="sec-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <DollarSign size={14} color="#8E3B46" />
                            <span>Experience-Based Salary Bands</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Annual CTC percentiles across career stages (Indian Tech Industry)
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-soft)', padding: '3px 8px', borderRadius: '4px' }}>
                          LPA (Lakhs/Year)
                        </span>
                      </div>

                      {/* Visual Range Bars for each experience tier */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {benchmark.salaryTiers.map((tier, idx) => {
                          const maxScale = 80;
                          const leftPct = (tier.min / maxScale) * 100;
                          const widthPct = ((tier.max - tier.min) / maxScale) * 100;
                          const medianPct = (tier.median / maxScale) * 100;

                          // Match with candidate level
                          const isCurrentTier =
                            (idx === 0 && (analysisData.candidate_level || '').includes('Entry')) ||
                            (idx === 1 && (analysisData.candidate_level || '').includes('Mid')) ||
                            (idx >= 2 && (analysisData.candidate_level || '').includes('Senior'));

                          return (
                            <div key={idx} style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              background: isCurrentTier ? 'rgba(142, 59, 70, 0.05)' : 'var(--bg-card-2)',
                              border: isCurrentTier ? '1px solid var(--primary)' : '1px solid var(--border)',
                              transition: 'all 0.2s ease'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                    {tier.level}
                                  </span>
                                  {isCurrentTier && (
                                    <span style={{ fontSize: '0.66rem', fontWeight: '800', background: 'var(--primary)', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>
                                      Your Tier
                                    </span>
                                  )}
                                </div>
                                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#8E3B46' }}>
                                  {tier.range}
                                </span>
                              </div>

                              {/* Graphic Range Track */}
                              <div style={{ position: 'relative', height: '10px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                                <div style={{
                                  position: 'absolute',
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  height: '100%',
                                  background: isCurrentTier ? 'linear-gradient(90deg, #8E3B46, #B96A73)' : 'linear-gradient(90deg, #A07840, #C9A875)',
                                  borderRadius: '99px'
                                }} />
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                <span>Min: ₹{tier.min}L</span>
                                <span style={{ fontWeight: '700', color: 'var(--text-body)' }}>Median: ₹{tier.median}L</span>
                                <span>Max: ₹{tier.max}L+</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                      * Top-tier product companies (FAANG/Tier-1) offer an additional 25–40% in variable stock/RSUs.
                    </div>
                  </div>
                </div>

                {/* 3. Visualizations Grid Row 2: In-Demand Skills Benchmark + Regional Hiring Hubs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
                  {/* Chart 3: Skills Market Benchmark vs Resume Readiness */}
                  <div className="card" style={{ padding: '22px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div>
                        <div className="sec-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <BarChart3 size={14} color="#8E3B46" />
                          <span>Technical Skill Market Demand Index</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                          Comparison of current hiring requirements vs your verified resume keywords
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', fontWeight: '800', color: '#2D6A4F', background: 'rgba(45, 106, 79, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                        {verifiedSkillsCount} / {benchmark.skillsBenchmark.length} Matched
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {benchmark.skillsBenchmark.map((skill, sidx) => {
                        const isVerified = detectedSkillsLower.some(
                          (ds) => ds.includes(skill.name.toLowerCase().split(' ')[0]) || skill.name.toLowerCase().includes(ds)
                        );

                        return (
                          <div key={sidx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)' }}>
                                  {skill.name}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', background: 'var(--bg-card-2)', padding: '1px 6px', borderRadius: '4px' }}>
                                  {skill.category}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {isVerified ? (
                                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <CheckCircle2 size={12} /> Verified
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#A07840', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Zap size={11} /> Skill Gap
                                  </span>
                                )}
                                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: '#8E3B46', minWidth: '32px', textAlign: 'right' }}>
                                  {skill.demand}%
                                </span>
                              </div>
                            </div>

                            {/* Graphical Bar */}
                            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${skill.demand}%`,
                                  height: '100%',
                                  background: isVerified
                                    ? 'linear-gradient(90deg, #2D6A4F, #52B788)'
                                    : 'linear-gradient(90deg, #A07840, #E0A96D)',
                                  borderRadius: '99px',
                                  transition: 'width 0.6s ease'
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Chart 4: Regional Tech Hubs & Openings Distribution */}
                  <div className="card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                        <div>
                          <div className="sec-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <MapPin size={14} color="#8E3B46" />
                            <span>Geographical Hiring Hub Distribution</span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                            Market share of open requisitions and local compensation benchmarks
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: 'var(--text-dim)', background: 'var(--bg-card-2)', padding: '3px 8px', borderRadius: '4px' }}>
                          India &amp; Remote
                        </span>
                      </div>

                      {/* City Progress Bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {benchmark.hubs.map((hub, hidx) => (
                          <div key={hidx}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <MapPin size={12} color="var(--primary)" />
                                {hub.city}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontSize: '0.72rem', color: '#8E3B46', fontWeight: '700' }}>
                                  Avg: {hub.salary}
                                </span>
                                <span style={{ fontSize: '0.76rem', fontWeight: '800', color: 'var(--text-body)', minWidth: '32px', textAlign: 'right' }}>
                                  {hub.pct}%
                                </span>
                              </div>
                            </div>

                            <div style={{ height: '8px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${hub.pct * 2}%`,
                                  height: '100%',
                                  background: 'linear-gradient(90deg, #8E3B46, #B96A73)',
                                  borderRadius: '99px',
                                  transition: 'width 0.6s ease'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-card-2)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={15} color="#8E3B46" />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-body)' }}>
                        <b>Bengaluru &amp; Hyderabad</b> represent over 64% of high-paying tech opportunities in this domain.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Visual Career Pathway & Milestone Roadmap */}
                <div className="card" style={{ padding: '24px 26px' }}>
                  <div style={{ marginBottom: '18px' }}>
                    <div className="sec-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="#8E3B46" />
                      <span>Career Progression &amp; Promotion Trajectory</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                      Key competencies and responsibilities required to unlock subsequent seniority bands in {domainKey}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', position: 'relative' }}>
                    {benchmark.careerRoadmap.map((step, sidx) => (
                      <div
                        key={sidx}
                        style={{
                          background: 'var(--bg-card-2)',
                          border: '1px solid var(--border)',
                          borderRadius: '10px',
                          padding: '16px 18px',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: sidx === 0 ? 'var(--primary)' : 'var(--primary-soft)',
                            color: sidx === 0 ? '#FFFFFF' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.75rem'
                          }}>
                            {sidx + 1}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-dim)', background: 'var(--bg-card)', padding: '2px 7px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                            {step.timeframe}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '6px' }}>
                          {step.role}
                        </h4>

                        <p style={{ fontSize: '0.76rem', color: 'var(--text-body)', lineHeight: '1.45', margin: 0 }}>
                          {step.focus}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

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
