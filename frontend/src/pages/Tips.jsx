import React, { useState } from 'react';
import {
  FileEdit,
  ShieldCheck,
  ListChecks,
  LayoutTemplate,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  Cpu,
  Rocket,
  Award,
  FileText,
  Search,
  Check,
  Target,
  Layers,
  Key,
  Zap,
  AlertTriangle,
  Flame
} from 'lucide-react';

export default function Tips() {
  const [activeTab, setActiveTab] = useState('writing');

  const dos = [
    { title: 'Quantify achievements with numbers', desc: 'Instead of "built React components", say "engineered 12 React interfaces, reducing page load latency by 32%".' },
    { title: 'Use strong action verbs', desc: 'Start bullets with: Led, Engineered, Optimized, Architected, Spearheaded, Developed, Implemented.' },
    { title: 'Reverse chronological order', desc: 'Place your most recent experience first. Recruiters scan top-down and expect this layout.' },
    { title: 'Tailor for each application', desc: 'Customize keywords from the job description into your Summary and Experience bullet points.' },
    { title: 'Include measurable impact', desc: 'Highlight percentage gains, revenue saved, users impacted, or response times lowered.' },
  ];

  const donts = [
    { title: 'No graphic skill bars or rating dots', desc: 'Never include rating stars or graphic skill bars (e.g. "Python 8/10"). ATS parsers cannot read them.' },
    { title: 'Omit profile photos', desc: 'In global markets, photos trigger unconscious bias and ATS software skips image-heavy PDFs.' },
    { title: 'One page for < 4 years experience', desc: 'Strictly keep your resume to 1 page unless you have 5+ years of extensive full-time experience.' },
    { title: 'Avoid generic objective statements', desc: 'Replace "Seeking a challenging role..." with a targeted 3-line Professional Summary.' },
    { title: 'Do not list 50+ tools in skills', desc: 'Focus on tools and technologies you can confidently explain and answer questions on in interviews.' },
  ];

  const sectionsGuide = [
    { icon: <FileText size={18} color="#8E3B46" />, title: 'Professional Summary', desc: '2-3 lines highlighting your key value proposition, core domain, and standout technical competencies.', color: '#8E3B46' },
    { icon: <Briefcase size={18} color="#2D6A4F" />, title: 'Work Experience', desc: 'Use bullet points with action verbs. Structure: Action → Context → Result with quantified metrics.', color: '#2D6A4F' },
    { icon: <GraduationCap size={18} color="#A07840" />, title: 'Education', desc: 'Degree, institution, graduation year. Add GPA only if above 8.0/10 or 3.5/4.0. Include coursework for freshers.', color: '#A07840' },
    { icon: <Cpu size={18} color="#8E3B46" />, title: 'Skills Section', desc: 'Group into categories: Languages, Frameworks, Cloud/Databases, Tools. Keep it clean and categorized.', color: '#8E3B46' },
    { icon: <Rocket size={18} color="#A07840" />, title: 'Key Projects', desc: 'Include 2-3 impactful projects with tech stack, your specific contribution, and live GitHub/demo links.', color: '#A07840' },
    { icon: <Award size={18} color="#2D6A4F" />, title: 'Certifications', desc: 'List verified credentials with issuing organization and date (e.g. AWS, Google Cloud, Meta).', color: '#2D6A4F' },
  ];

  const atsRules = [
    { title: '1. Standard Single-Column Layout', desc: 'Multi-column tables or floating text boxes scramble text order in ATS parsers like Workday and Taleo.' },
    { title: '2. Standard Web & System Fonts', desc: 'Use clean fonts: Inter, Arial, Helvetica, Calibri, or Times New Roman. Decorative custom fonts break extraction.' },
    { title: '3. No Critical Info in Headers or Footers', desc: 'Contact info placed exclusively in PDF headers or footers is skipped by over 60% of automated scrapers.' },
    { title: '4. Native Text PDF or DOCX Export', desc: 'Never submit scanned images or rasterized Canva exports. Ensure all text can be selected and copied.' },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">Recruitment Resources</span>
        <h1 className="page-title">Resume Guidelines &amp; Formats</h1>
        <p className="page-subtitle">
          Curated standards, ATS compliance checklists, and section formatting rules used by top engineering recruitment teams.
        </p>
      </div>

      <div className="tab-header">
        {[
          { id: 'writing', label: 'Writing Best Practices', icon: <FileEdit size={14} /> },
          { id: 'ats', label: 'ATS Guidelines', icon: <ShieldCheck size={14} /> },
          { id: 'sections', label: 'Section Checklist', icon: <ListChecks size={14} /> },
          { id: 'templates', label: 'Template Styles', icon: <LayoutTemplate size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'writing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card">
            <div className="sec-label" style={{ color: '#2D6A4F', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={15} />
              <span>Resume Writing Do's</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {dos.map((item, idx) => (
                <div key={idx} className="card-sm" style={{ background: 'rgba(45, 106, 79, 0.04)', border: '1px solid rgba(45, 106, 79, 0.16)' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#2D6A4F', marginBottom: '4px' }}>
                    {idx + 1}. {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="sec-label" style={{ color: '#C0392B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <XCircle size={15} />
              <span>Resume Writing Don'ts</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {donts.map((item, idx) => (
                <div key={idx} className="card-sm" style={{ background: 'rgba(192, 57, 43, 0.04)', border: '1px solid rgba(192, 57, 43, 0.16)' }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#C0392B', marginBottom: '4px' }}>
                    {idx + 1}. {item.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ats' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Column 1: Parser Mechanics & Rules */}
          <div className="card">
            <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Search size={15} color="#8E3B46" />
              <span>How Enterprise ATS Parsers Work</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
              Applicant Tracking Systems (ATS) convert PDF/DOCX files into structured semantic databases. Resumes that fail keyword density benchmarks or structural parsing are filtered out before reaching human hiring managers.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {atsRules.map((rule, idx) => (
                <div key={idx} className="card-sm" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '3px' }}>
                    {rule.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.45' }}>{rule.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Rich Keyword Strategy & STAR Transformation */}
          <div>
            <div className="card" style={{ marginBottom: '18px' }}>
              <div className="sec-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Target size={15} color="#8E3B46" />
                <span>Keyword Density &amp; Acronym Placement</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '12px' }}>
                Always mirror both full-length terms and standard abbreviations so your resume matches automated keyword search variations.
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px 12px', background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-body)' }}>
                  🔹 <b>Include Dual Terms:</b> Write <i>"Natural Language Processing (NLP)"</i> or <i>"Amazon Web Services (AWS)"</i>.
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-body)' }}>
                  🔹 <b>Optimal Density:</b> Mention core role tools 2–3 times naturally across Summary, Experience, and Skills.
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.78rem', color: 'var(--text-body)' }}>
                  🔹 <b>No Keyword Stuffing:</b> Avoid invisible white text or random lists; ATS scoring penalizes un-contextualized keywords.
                </div>
              </div>
            </div>

            {/* Before / After STAR Card */}
            <div className="card" style={{ borderLeft: '3px solid #8E3B46' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#8E3B46', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} />
                <span>STAR Method: Before &amp; After Transformation</span>
              </div>
              
              <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(192, 57, 43, 0.04)', border: '1px solid rgba(192, 57, 43, 0.18)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#C0392B', textTransform: 'uppercase', marginBottom: '2px' }}>❌ Generic Weak Bullet:</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-body)', fontStyle: 'italic' }}>"Built machine learning models in Python for image analysis."</div>
              </div>

              <div style={{ padding: '10px', background: 'rgba(45, 106, 79, 0.04)', border: '1px solid rgba(45, 106, 79, 0.18)', borderRadius: '6px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#2D6A4F', textTransform: 'uppercase', marginBottom: '2px' }}>✅ High-Impact STAR Bullet:</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-body)' }}>"Architected a custom CNN model in PyTorch, achieving 94.2% validation accuracy across 10,000+ medical images and cutting model inference latency by 35%."</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sections' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {sectionsGuide.map((s, idx) => (
            <div key={idx} className="card" style={{ borderLeft: `3px solid ${s.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'var(--bg-card-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {s.icon}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-main)' }}>{s.title}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.55' }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'templates' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card" style={{ borderLeft: '3px solid #8E3B46' }}>
            <div className="sec-label" style={{ color: '#8E3B46', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={14} />
              <span>Modern Single Column</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Best for: Tech, Startups, Product, Design
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              • Helvetica / Inter sans-serif typography<br />
              • Clean whitespace with subtle accent highlights<br />
              • Organized skills section for instant recruiter scanning<br />
              • Links to GitHub, LinkedIn, and live project deployments
            </div>
          </div>

          <div className="card" style={{ borderLeft: '3px solid #A07840' }}>
            <div className="sec-label" style={{ color: '#A07840', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span>Classic Single Column</span>
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '8px' }}>
              Best for: Finance, Law, Consulting, Corporate
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              • Times-Roman serif typography<br />
              • Conservative layout with formal section dividers<br />
              • Strict formatting without decorative graphics<br />
              • Ideal for enterprise ATS screening filters
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
