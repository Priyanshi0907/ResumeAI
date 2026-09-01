import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BarChart3,
  Brain,
  Target,
  BookOpen,
  FileCheck,
  Mail,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Users,
  Edit3,
  GraduationCap,
  Check,
  Layers,
  FileText
} from 'lucide-react';

export default function Home({ setActivePage }) {
  const { isLoggedIn } = useAuth();

  const handleStartAnalysis = () => {
    if (isLoggedIn) {
      setActivePage('dashboard');
    } else {
      setActivePage('auth');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section id="hero" style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '3rem', alignItems: 'center', marginTop: '1rem', marginBottom: '4rem' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(142, 59, 70, 0.08)',
              border: '1px solid rgba(142, 59, 70, 0.25)',
              borderRadius: '100px',
              padding: '6px 14px',
              fontSize: '0.72rem',
              fontWeight: '700',
              color: '#8E3B46',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '20px',
            }}
          >
            <Sparkles size={13} color="#8E3B46" />
            <span>AI-Powered Career Intelligence</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
              fontWeight: '900',
              lineHeight: '1.1',
              letterSpacing: '-0.04em',
              color: '#1A1212',
              marginBottom: '16px',
            }}
          >
            Analyze. Improve.<br />
            <span
              style={{
                color: '#8E3B46',
              }}
            >
              Land your dream job.
            </span>
          </h1>

          <p
            style={{
              fontSize: '1.02rem',
              color: '#7A6B65',
              lineHeight: '1.7',
              marginBottom: '32px',
              maxWidth: '560px',
            }}
          >
            Upload your resume and get instant ATS feedback, section completeness scoring, professional domain prediction, and personalized course tracks — in seconds.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
            <button
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
              onClick={handleStartAnalysis}
            >
              <BarChart3 size={17} />
              <span>Analyze Resume</span>
            </button>

            <button
              className="btn-secondary"
              style={{ padding: '12px 24px', fontSize: '0.92rem' }}
              onClick={handleStartAnalysis}
            >
              <Target size={17} />
              <span>Match To a Job</span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#7A6B65' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} color="#8E3B46" strokeWidth={2.5} /> ATS-friendly scoring
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} color="#8E3B46" strokeWidth={2.5} /> 5+ key career domains
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Check size={14} color="#8E3B46" strokeWidth={2.5} /> Free &amp; Instant
            </div>
          </div>
        </div>

        {/* Mock Visual UI Showcase */}
        <div>
          <div
            className="card"
            style={{
              background: '#FFFFFF',
              borderColor: '#E2D8CE',
              padding: '24px',
              boxShadow: '0 8px 24px rgba(26, 18, 18, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #F0EAE3', paddingBottom: '12px', marginBottom: '16px' }}>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#8E3B46' }}></div>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#C9A46A' }}></div>
              <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#D9D0C7' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <BarChart3 size={13} color="#8E3B46" />
                <span style={{ fontSize: '0.72rem', color: '#7A6B65', fontWeight: '600' }}>
                  ATS Analysis Dashboard
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '18px' }}>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#8E3B46' }}>
                  85<span style={{ fontSize: '0.8rem', color: '#A89990', fontWeight: '400' }}>/100</span>
                </div>
                <div style={{ fontSize: '0.62rem', color: '#A89990', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Resume Score</div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1A1212' }}>Web Dev</div>
                <div style={{ fontSize: '0.62rem', color: '#A89990', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Career Field</div>
              </div>
              <div className="kpi-card" style={{ padding: '12px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#1A1212' }}>Mid-level</div>
                <div style={{ fontSize: '0.62rem', color: '#A89990', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: '700' }}>Experience</div>
              </div>
            </div>

            <div style={{ fontSize: '0.66rem', color: '#A89990', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Completed Sections
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              <span className="chip-g">✓ Skills</span>
              <span className="chip-g">✓ Education</span>
              <span className="chip-g">✓ Experience</span>
              <span className="chip-r">✗ Achievements</span>
            </div>

            <div style={{ fontSize: '0.66rem', color: '#A89990', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Missing Skills Recommended
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              <span className="chip-p">Docker</span>
              <span className="chip-p">TypeScript</span>
              <span className="chip-p">CI/CD</span>
            </div>

            <div
              style={{
                background: 'rgba(142, 59, 70, 0.05)',
                border: '1px solid rgba(142, 59, 70, 0.15)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '0.8rem',
                color: '#8E3B46',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '500',
              }}
            >
              <GraduationCap size={15} color="#8E3B46" />
              <span>Full Stack Development — Udacity Nanodegree</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Band */}
      <section className="stats-band">
        <div className="stat-cell">
          <div className="stat-big">10,000+</div>
          <div className="stat-lbl">Resumes Analyzed</div>
        </div>
        <div className="stat-cell">
          <div className="stat-big">94%</div>
          <div className="stat-lbl">ATS Match Rate</div>
        </div>
        <div className="stat-cell">
          <div className="stat-big">5+</div>
          <div className="stat-lbl">Supported Fields</div>
        </div>
        <div className="stat-cell">
          <div className="stat-big">100%</div>
          <div className="stat-lbl">Secure &amp; Private</div>
        </div>
      </section>

      {/* Core Features Section (Capabilities) */}
      <section id="capabilities" style={{ marginBottom: '4rem', scrollMarginTop: '80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span className="eyebrow">Platform Capabilities</span>
          <h2 className="page-title" style={{ fontSize: '2rem' }}>
            Everything you need to ship a winning resume
          </h2>
          <p className="page-subtitle">
            Optimize your job applications with intelligent modules designed on real recruiter screening criteria.
          </p>
        </div>

        <div className="grid-3">
          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <BarChart3 size={20} />
            </div>
            <div className="feat-title">ATS Resume Health Score</div>
            <div className="feat-desc">
              Comprehensive 0–100 score based on section completeness, contact details, and ATS parseability.
            </div>
          </div>

          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <Brain size={20} />
            </div>
            <div className="feat-title">Career Field Prediction</div>
            <div className="feat-desc">
              Analyzes your detected technical skills to classify your profile across Data Science, Web, Cloud, Mobile, and UI/UX.
            </div>
          </div>

          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <Target size={20} />
            </div>
            <div className="feat-title">Job Description Matching</div>
            <div className="feat-desc">
              Paste target job requirements and get instant compatibility scores and missing keyword diffs.
            </div>
          </div>

          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <BookOpen size={20} />
            </div>
            <div className="feat-title">Curated Learning Pathways</div>
            <div className="feat-desc">
              Targeted course and certification recommendations from Coursera, Udacity, and Udemy.
            </div>
          </div>

          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <Edit3 size={20} />
            </div>
            <div className="feat-title">AI Tailored Resume Builder</div>
            <div className="feat-desc">
              Rewrite resume bullet points using the STAR method with injected missing keywords for targeted ATS clearance.
            </div>
          </div>

          <div className="feat-card" onClick={handleStartAnalysis} style={{ cursor: 'pointer' }}>
            <div className="feat-icon-box">
              <Mail size={20} />
            </div>
            <div className="feat-title">AI Cover Letter Writer</div>
            <div className="feat-desc">
              Generate tailored, persuasive 3-paragraph cover letters tailored specifically to your target job.
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Reviews) */}
      <section id="reviews" style={{ marginBottom: '3rem', scrollMarginTop: '80px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="eyebrow">Success Stories</span>
          <h2 className="page-title" style={{ fontSize: '1.8rem' }}>
            Loved by candidates worldwide
          </h2>
        </div>

        <div className="grid-3">
          <div className="feat-card">
            <div style={{ fontSize: '1.5rem', color: '#D4B8BC', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>“</div>
            <div style={{ fontSize: '0.85rem', color: '#7A6B65', lineHeight: '1.65', marginBottom: '18px' }}>
              ResumeAI identified missing keyword gaps in my resume. After tailoring it to the JD, I received 3 interview calls the same week!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#8E3B46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>P</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1212' }}>Priya S.</div>
                <div style={{ fontSize: '0.72rem', color: '#A89990' }}>Software Engineer, Bangalore</div>
              </div>
            </div>
          </div>

          <div className="feat-card">
            <div style={{ fontSize: '1.5rem', color: '#D4B8BC', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>“</div>
            <div style={{ fontSize: '0.85rem', color: '#7A6B65', lineHeight: '1.65', marginBottom: '18px' }}>
              The section-by-section ATS checklist is game changing. I raised my ATS score from 60 to 92 and cleared recruiter screening instantly.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#6B5048', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>M</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1212' }}>Marcus T.</div>
                <div style={{ fontSize: '0.72rem', color: '#A89990' }}>DevOps Engineer, Mumbai</div>
              </div>
            </div>
          </div>

          <div className="feat-card">
            <div style={{ fontSize: '1.5rem', color: '#D4B8BC', marginBottom: '10px', fontFamily: 'Georgia, serif' }}>“</div>
            <div style={{ fontSize: '0.85rem', color: '#7A6B65', lineHeight: '1.65', marginBottom: '18px' }}>
              Correctly predicted Data Science based on my projects and recommended the right certifications. Super clean interface!
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#A07840', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '0.85rem' }}>A</div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1A1212' }}>Amit K.</div>
                <div style={{ fontSize: '0.72rem', color: '#A89990' }}>Data Analyst, Delhi</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
