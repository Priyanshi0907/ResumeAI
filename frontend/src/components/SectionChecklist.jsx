import React, { useState, useMemo } from 'react';
import {
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Copy, Check,
  ExternalLink, Mail, Phone, User, Globe, MapPin, Code2,
  Award, Briefcase, FolderGit2, Calendar, Maximize2, Minimize2,
  Lightbulb, AlertCircle, Sparkles, FileText
} from 'lucide-react';
import { extractResumeSections, extractPersonalDetails } from '../utils/sectionExtractor';

const LinkedInIcon = ({ size = 15, color = '#0A66C2' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const GitHubIcon = ({ size = 15, color = 'var(--text-main)' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
    <path d="M9 18c-4.51 2-5-2-7-2"></path>
  </svg>
);

export default function SectionChecklist({
  resumeText = '',
  checksResult = [],
  initialPersonalInfo = {},
  title = 'Section Checklist'
}) {
  const [expandedSections, setExpandedSections] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [showAllSkillsMap, setShowAllSkillsMap] = useState({});


  // Extract sections & personal details in real-time
  const sections = useMemo(() => {
    return extractResumeSections(resumeText, checksResult);
  }, [resumeText, checksResult]);

  const personalInfo = useMemo(() => {
    return extractPersonalDetails(resumeText, initialPersonalInfo);
  }, [resumeText, initialPersonalInfo]);

  const detectedCount = sections.filter((s) => s.found).length;
  const totalCount = sections.length;
  const totalEarnedPoints = sections.filter((s) => s.found).reduce((acc, s) => acc + s.points, 0);

  const toggleSection = (id) => {
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandAll = () => {
    const all = {};
    sections.forEach((s) => {
      all[s.id] = true;
    });
    setExpandedSections(all);
  };

  const collapseAll = () => {
    setExpandedSections({});
  };

  const handleCopy = (id, textToCopy, e) => {
    if (e) e.stopPropagation();
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="section-checklist-container">
      {/* ─────────────────────────────────────────────────────────────
          1. Extracted Personal & Contact Details Card
          ───────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card-2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '16px 18px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{
            fontSize: '0.74rem',
            textTransform: 'uppercase',
            fontWeight: '800',
            letterSpacing: '0.05em',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <User size={14} />
            <span>Extracted Personal &amp; Contact Details</span>
          </div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: '600',
            padding: '2px 8px',
            borderRadius: '99px',
            background: personalInfo.email && personalInfo.phone ? 'rgba(45, 106, 79, 0.1)' : 'rgba(160, 120, 64, 0.1)',
            color: personalInfo.email && personalInfo.phone ? '#2D6A4F' : '#A07840',
            border: `1px solid ${personalInfo.email && personalInfo.phone ? 'rgba(45, 106, 79, 0.25)' : 'rgba(160, 120, 64, 0.25)'}`
          }}>
            {personalInfo.email && personalInfo.phone ? '✓ Contact Verified' : 'Incomplete Contact'}
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px'
        }}>
          {/* Candidate Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <User size={15} color="var(--primary)" style={{ flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Candidate Name</div>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {personalInfo.name || 'Candidate on File'}
              </div>
            </div>
          </div>

          {/* Email */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <Mail size={15} color={personalInfo.email ? '#2D6A4F' : 'var(--text-dim)'} style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Email Address</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: personalInfo.email ? 'var(--text-main)' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {personalInfo.email || 'Not detected'}
                </div>
              </div>
            </div>
            {personalInfo.email && (
              <button
                type="button"
                onClick={(e) => handleCopy('email', personalInfo.email, e)}
                title="Copy Email"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
              >
                {copiedId === 'email' ? <Check size={13} color="#2D6A4F" /> : <Copy size={13} />}
              </button>
            )}
          </div>

          {/* Phone Number */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <Phone size={15} color={personalInfo.phone ? '#2D6A4F' : 'var(--text-dim)'} style={{ flexShrink: 0 }} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>Phone / Contact</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: personalInfo.phone ? 'var(--text-main)' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {personalInfo.phone || 'Not detected'}
                </div>
              </div>
            </div>
            {personalInfo.phone && (
              <button
                type="button"
                onClick={(e) => handleCopy('phone', personalInfo.phone, e)}
                title="Copy Phone"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px' }}
              >
                {copiedId === 'phone' ? <Check size={13} color="#2D6A4F" /> : <Copy size={13} />}
              </button>
            )}
          </div>

          {/* LinkedIn Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <LinkedInIcon size={15} color={personalInfo.linkedin ? '#0A66C2' : 'var(--text-dim)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>LinkedIn Profile</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: personalInfo.linkedin ? '#0A66C2' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {personalInfo.linkedin ? (
                    <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {personalInfo.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '') || 'LinkedIn'}
                    </a>
                  ) : 'Not detected'}
                </div>
              </div>
            </div>
            {personalInfo.linkedin && (
              <a href={personalInfo.linkedin.startsWith('http') ? personalInfo.linkedin : `https://${personalInfo.linkedin}`} target="_blank" rel="noreferrer" title="Open LinkedIn Profile" style={{ color: 'var(--text-muted)' }}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* GitHub Profile */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            padding: '8px 12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <GitHubIcon size={15} color={personalInfo.github ? 'var(--text-main)' : 'var(--text-dim)'} />
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>GitHub Profile</div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: personalInfo.github ? 'var(--text-main)' : 'var(--text-dim)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {personalInfo.github ? (
                    <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {personalInfo.github.replace(/^https?:\/\/(www\.)?github\.com\//, '') || 'GitHub'}
                    </a>
                  ) : 'Not detected'}
                </div>
              </div>
            </div>
            {personalInfo.github && (
              <a href={personalInfo.github.startsWith('http') ? personalInfo.github : `https://${personalInfo.github}`} target="_blank" rel="noreferrer" title="Open GitHub Profile" style={{ color: 'var(--text-muted)' }}>
                <ExternalLink size={13} />
              </a>
            )}
          </div>

          {/* Location / Portfolio */}
          {(personalInfo.location || personalInfo.portfolio) && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              {personalInfo.location ? <MapPin size={15} color="#A07840" style={{ flexShrink: 0 }} /> : <Globe size={15} color="#A07840" style={{ flexShrink: 0 }} />}
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: '700' }}>
                  {personalInfo.location ? 'Location' : 'Portfolio Link'}
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {personalInfo.location || personalInfo.portfolio}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Section Checklist Header & Controls
          ───────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="sec-label" style={{ margin: 0 }}>
            {title} ({detectedCount}/{totalCount} Detected)
          </div>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            padding: '2px 8px',
            borderRadius: '99px',
            background: detectedCount >= 5 ? 'rgba(45, 106, 79, 0.12)' : 'rgba(160, 120, 64, 0.12)',
            color: detectedCount >= 5 ? '#2D6A4F' : '#A07840',
            border: `1px solid ${detectedCount >= 5 ? 'rgba(45, 106, 79, 0.3)' : 'rgba(160, 120, 64, 0.3)'}`
          }}>
            {totalEarnedPoints}/100 pts
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={expandAll}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Maximize2 size={12} />
            <span>Expand All</span>
          </button>
          <button
            type="button"
            onClick={collapseAll}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease'
            }}
          >
            <Minimize2 size={12} />
            <span>Collapse All</span>
          </button>
        </div>
      </div>

      <div style={{
        fontSize: '0.76rem',
        color: 'var(--text-dim)',
        marginBottom: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Lightbulb size={13} color="#8E3B46" />
        <span>Click any section below to see individual project cards, summaries, stack badges, and live demo links.</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. Section Items List (Accordion)
          ───────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sections.map((item) => {
          const isExpanded = Boolean(expandedSections[item.id]);

          return (
            <div
              key={item.id}
              style={{
                borderRadius: '10px',
                border: `1px solid ${
                  isExpanded
                    ? 'var(--primary)'
                    : item.found
                    ? 'rgba(45, 106, 79, 0.22)'
                    : 'rgba(192, 57, 43, 0.2)'
                }`,
                background: item.found
                  ? isExpanded
                    ? 'var(--bg-card-2)'
                    : 'rgba(45, 106, 79, 0.03)'
                  : isExpanded
                  ? 'var(--bg-card-2)'
                  : 'rgba(192, 57, 43, 0.03)',
                overflow: 'hidden',
                transition: 'all 0.2s ease',
                boxShadow: isExpanded ? '0 4px 14px rgba(0,0,0,0.06)' : 'none'
              }}
            >
              {/* Clickable Header Row */}
              <div
                onClick={() => toggleSection(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: isExpanded ? 'rgba(142, 59, 70, 0.05)' : 'transparent'
                }}
                role="button"
                tabIndex={0}
                aria-expanded={isExpanded}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.found ? 'rgba(45, 106, 79, 0.12)' : 'rgba(192, 57, 43, 0.12)',
                    flexShrink: 0
                  }}>
                    {item.found ? (
                      <CheckCircle2 size={16} color="#2D6A4F" />
                    ) : (
                      <XCircle size={16} color="#C0392B" />
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.88rem',
                        fontWeight: '700',
                        color: item.found ? 'var(--text-main)' : '#C0392B'
                      }}>
                        {item.label}
                      </span>
                      {item.found && item.wordCount > 0 && (
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: 'var(--border)',
                          color: 'var(--text-muted)',
                          fontWeight: '600'
                        }}>
                          {item.wordCount} words
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.8rem',
                    color: item.found ? '#2D6A4F' : 'var(--text-dim)',
                    fontWeight: '700'
                  }}>
                    {item.found ? `+${item.points} pts` : `Missing (${item.points} pts)`}
                  </span>

                  {/* Copy Text — inline in header, only when found */}
                  {item.found && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(item.id, item.cleanContent || item.content, e);
                      }}
                      title="Copy section text"
                      style={{
                        background: copiedId === item.id ? '#2D6A4F' : 'var(--bg-card)',
                        color: copiedId === item.id ? '#fff' : 'var(--text-main)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        padding: '3px 9px',
                        fontSize: '0.72rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {copiedId === item.id ? <Check size={12} /> : <Copy size={12} />}
                      <span>{copiedId === item.id ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}

                  <div style={{
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px',
                    borderRadius: '4px',
                    background: isExpanded ? 'var(--border)' : 'transparent'
                  }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>
              </div>

              {/* Collapsible Content Drawer */}
              {isExpanded && (
                <div style={{
                  padding: '16px',
                  borderTop: '1px solid var(--border)',
                  background: 'var(--bg-main)'
                }}>
                  {item.found ? (
                    /* Content Found in Resume — always show summary cards */
                    <div>
                      {/* ──────────────────────────────────────────────
                          Itemized Smart Summary Cards
                          ────────────────────────────────────────────── */}
                      {true && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {/* A. Itemized Projects Cards */}
                          {item.id === 'projects' && item.summary?.itemCards?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {item.summary.itemCards.map((proj, pIdx) => (
                                <div
                                  key={pIdx}
                                  style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '14px 16px',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                                  }}
                                >
                                  {/* Heading & Links Header */}
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '6px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <FolderGit2 size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                      <span style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                        {proj.title}
                                      </span>
                                    </div>

                                    {/* Project Links */}
                                    {proj.links?.length > 0 && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {proj.links.map((link, lIdx) => (
                                          <a
                                            key={lIdx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '4px',
                                              padding: '3px 8px',
                                              borderRadius: '6px',
                                              background: link.type === 'github' ? 'rgba(0,0,0,0.06)' : 'rgba(142, 59, 70, 0.08)',
                                              color: link.type === 'github' ? 'var(--text-main)' : 'var(--primary)',
                                              fontSize: '0.72rem',
                                              fontWeight: '700',
                                              textDecoration: 'none',
                                              border: '1px solid var(--border)'
                                            }}
                                          >
                                            {link.type === 'github' ? <GitHubIcon size={12} /> : <Globe size={12} />}
                                            <span>{link.label}</span>
                                            <ExternalLink size={10} />
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Small Concise Summary */}
                                  <div style={{ fontSize: '0.83rem', color: 'var(--text-body)', lineHeight: '1.55', marginBottom: '10px' }}>
                                    {proj.summary}
                                  </div>

                                  {/* Tech Stack Chips */}
                                  {proj.stack?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-dim)', marginRight: '4px' }}>
                                        Tech Stack:
                                      </span>
                                      {proj.stack.map((stk, sIdx) => (
                                        <span key={sIdx} className="chip-p" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                                          {stk}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* B. Itemized Certifications Cards — bullet-style list */}
                          {item.id === 'certifications' && item.summary?.itemCards?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {item.summary.itemCards.map((cert, cIdx) => (
                                <div
                                  key={cIdx}
                                  style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '10px 14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px'
                                  }}
                                >
                                  {/* Bullet icon */}
                                  <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '8px',
                                    background: 'rgba(160, 120, 64, 0.12)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#A07840',
                                    flexShrink: 0
                                  }}>
                                    <Award size={16} />
                                  </div>

                                  {/* Title + issuer row */}
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: '0.88rem',
                                      fontWeight: '700',
                                      color: 'var(--text-main)',
                                      marginBottom: '2px',
                                      whiteSpace: 'nowrap',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis'
                                    }}>
                                      {cert.title}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                      <span style={{
                                        fontSize: '0.73rem',
                                        fontWeight: '600',
                                        color: 'var(--primary)',
                                        background: 'rgba(142, 59, 70, 0.07)',
                                        border: '1px solid rgba(142, 59, 70, 0.18)',
                                        borderRadius: '4px',
                                        padding: '1px 7px'
                                      }}>
                                        {cert.issuer}
                                      </span>
                                      {cert.date && (
                                        <span style={{ fontSize: '0.71rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                          <Calendar size={11} />
                                          {cert.date}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : null}


                          {/* C. Itemized Work Experience / Internships Cards */}
                          {item.id === 'experience' && item.summary?.itemCards?.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {item.summary.itemCards.map((exp, eIdx) => (
                                <div
                                  key={eIdx}
                                  style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    padding: '14px 16px'
                                  }}
                                >
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    marginBottom: '6px',
                                    flexWrap: 'wrap',
                                    gap: '8px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <Briefcase size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                      <div>
                                        <div style={{ fontSize: '0.94rem', fontWeight: '800', color: 'var(--text-main)' }}>
                                          {exp.role}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                                          {exp.company} {exp.location ? `• ${exp.location}` : ''}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Metrics Badges */}
                                    {exp.metrics?.length > 0 && (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {exp.metrics.slice(0, 3).map((m, mIdx) => (
                                          <span key={mIdx} style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '700',
                                            padding: '2px 7px',
                                            borderRadius: '4px',
                                            background: 'rgba(45, 106, 79, 0.08)',
                                            color: '#2D6A4F',
                                            border: '1px solid rgba(45, 106, 79, 0.2)'
                                          }}>
                                            📊 {m}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  {/* Small Summary */}
                                  <div style={{ fontSize: '0.83rem', color: 'var(--text-body)', lineHeight: '1.55', marginBottom: '10px' }}>
                                    {exp.summary}
                                  </div>

                                  {/* Tech Stack */}
                                  {exp.stack?.length > 0 && (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-dim)', marginRight: '4px' }}>
                                        Tech Used:
                                      </span>
                                      {exp.stack.map((stk, sIdx) => (
                                        <span key={sIdx} className="chip-p" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                                          {stk}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : null}

                          {/* D. Default Fallback Card (Summary, Skills, Education, Achievements) */}
                          {(!item.summary?.itemCards || item.summary.itemCards.length === 0) && (
                            <div style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              borderRadius: '8px',
                              padding: '16px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '12px'
                            }}>
                              <div>
                                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                                  {item.summary?.title || item.label}
                                </div>
                                <div style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: '1.55' }}>
                                  {item.summary?.synopsis}
                                </div>
                              </div>

                              {item.id === 'skills' && item.summary?.allSkills?.length > 0 ? (
                                (() => {
                                  const allSkills = item.summary.allSkills;
                                  const isExpanded = !!showAllSkillsMap[item.id];
                                  const displaySkills = isExpanded ? allSkills : allSkills.slice(0, 10);
                                  const extra = allSkills.length - 10;
                                  return (
                                    <div>
                                      <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                                        Key Competencies &amp; Tools
                                      </div>
                                      <div className="chip-wrap" style={{ gap: '6px' }}>
                                        {displaySkills.map((stk, sIdx) => (
                                          <span key={sIdx} className="chip-p" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                                            {stk}
                                          </span>
                                        ))}
                                      </div>
                                      {allSkills.length > 10 && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setShowAllSkillsMap(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                          }}
                                          style={{
                                            marginTop: '8px',
                                            background: 'transparent',
                                            border: '1px solid var(--border)',
                                            borderRadius: '6px',
                                            padding: '4px 12px',
                                            fontSize: '0.73rem',
                                            fontWeight: '700',
                                            color: 'var(--primary)',
                                            cursor: 'pointer',
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            transition: 'all 0.15s ease'
                                          }}
                                        >
                                          {isExpanded ? (
                                            <><Minimize2 size={11} /> Show Less</>
                                          ) : (
                                            <><Maximize2 size={11} /> View More (+{extra} more)</>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : item.summary?.stack?.length > 0 ? (
                                <div>
                                  <div style={{ fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>
                                    Key Competencies &amp; Tools
                                  </div>
                                  <div className="chip-wrap" style={{ gap: '6px' }}>
                                    {item.summary.stack.map((stk, sIdx) => (
                                      <span key={sIdx} className="chip-p" style={{ fontSize: '0.74rem', padding: '3px 8px' }}>
                                        {stk}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          )}

                        </div>
                      )}


                      {/* Pro Tip */}
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(142, 59, 70, 0.06)',
                        border: '1px solid rgba(142, 59, 70, 0.15)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <Sparkles size={14} color="#8E3B46" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <div style={{ fontSize: '0.77rem', color: 'var(--text-body)', lineHeight: '1.5' }}>
                          <strong style={{ color: '#8E3B46' }}>ATS Optimization Tip: </strong>
                          {item.proTip}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Content Missing in Resume */
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '12px',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: 'rgba(192, 57, 43, 0.08)',
                        border: '1px solid rgba(192, 57, 43, 0.2)',
                        color: '#C0392B'
                      }}>
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          <strong>Missing Section: </strong>
                          This section was not found in your uploaded resume. Adding it can increase your ATS score by <strong>+{item.points} pts</strong>.
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          fontWeight: '800',
                          letterSpacing: '0.05em',
                          color: '#A07840',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <FileText size={13} />
                          <span>Recommended ATS Template Format</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleCopy(item.id, item.templateExample, e)}
                          style={{
                            background: copiedId === item.id ? '#2D6A4F' : 'var(--bg-card)',
                            color: copiedId === item.id ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '0.74rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check size={12} />
                              <span>Template Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy Template</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div style={{
                        background: 'var(--bg-card)',
                        border: '1px dashed var(--border-strong)',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        fontSize: '0.8rem',
                        lineHeight: '1.6',
                        color: 'var(--text-muted)',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {item.templateExample}
                      </div>

                      <div style={{
                        marginTop: '10px',
                        fontSize: '0.76rem',
                        color: 'var(--text-dim)',
                        lineHeight: '1.5'
                      }}>
                        💡 <strong>Recommendation:</strong> {item.proTip}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
