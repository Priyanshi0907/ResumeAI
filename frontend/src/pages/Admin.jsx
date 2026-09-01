import React, { useState, useEffect } from 'react';
import { adminApi, feedbackApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  Download,
  Trash2,
  FileText,
  TrendingUp,
  Star,
  Users,
  LogOut,
  RefreshCw,
  BarChart3,
  MessageSquare,
  FolderArchive
} from 'lucide-react';

export default function Admin({ setActivePage }) {
  const { logoutAdmin, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('candidates');
  const [selectedPdf, setSelectedPdf] = useState(null);

  const fetchAllAdminData = async () => {
    try {
      const [mRes, uRes, fbRes, pdfRes] = await Promise.all([
        adminApi.getMetrics(),
        adminApi.getUsers(searchTerm),
        feedbackApi.getAll(),
        adminApi.getPdfs(),
      ]);

      if (mRes.data.success) setMetrics(mRes.data.data);
      if (uRes.data.success) setCandidates(uRes.data.data);
      if (fbRes.data.success) setFeedbackList(fbRes.data.data);
      if (pdfRes.data.success) {
        setPdfs(pdfRes.data.data);
        if (pdfRes.data.data.length > 0 && !selectedPdf) {
          setSelectedPdf(pdfRes.data.data[0].filename);
        }
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setActivePage('auth');
      return;
    }
    fetchAllAdminData();
  }, [isAdmin, searchTerm]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm(`Permanently remove candidate record #${id}?`)) return;
    try {
      const res = await adminApi.deleteUser(id);
      if (res.data.success) {
        fetchAllAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setActivePage('home');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="eyebrow">Administration Oversight</span>
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Staff Analytics Portal</h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={fetchAllAdminData} title="Refresh Data">
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            <LogOut size={14} />
            <span>Exit Admin Portal</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '28px' }}>
          <div className="kpi-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{metrics.totalScans}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Total Scans</div>
          </div>
          <div className="kpi-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#8E3B46' }}>{metrics.avgScore}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Avg ATS Score</div>
          </div>
          <div className="kpi-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#A07840' }}>{metrics.avgRating}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Avg Rating</div>
          </div>
          <div className="kpi-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{metrics.totalReviews}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Reviews Logged</div>
          </div>
          <div className="kpi-card" style={{ padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-body)' }}>{metrics.storedPdfs}</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>Stored PDF Files</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tab-header">
        {[
          { id: 'candidates', label: `Candidates (${candidates.length})`, icon: <Users size={14} /> },
          { id: 'charts', label: 'Distributions', icon: <BarChart3 size={14} /> },
          { id: 'feedback', label: `Feedback Feed (${feedbackList.length})`, icon: <MessageSquare size={14} /> },
          { id: 'pdfs', label: `PDF Library (${pdfs.length})`, icon: <FolderArchive size={14} /> },
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

      {/* Tab 1: Candidates Database Table */}
      {activeTab === 'candidates' && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search name, email, field, or level..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <a
              href={adminApi.exportCsvUrl}
              download="candidates_export.csv"
              className="btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              <Download size={14} />
              <span>Export CSV/Excel</span>
            </a>
          </div>

          <div className="data-table-container" style={{ maxHeight: '500px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Score</th>
                  <th>Domain</th>
                  <th>Level</th>
                  <th>Timestamp</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                      No candidate submissions found.
                    </td>
                  </tr>
                ) : (
                  candidates.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: '700', color: '#8E3B46' }}>#{c.id}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{c.name || c.act_name || 'N/A'}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.email || c.act_mail || 'N/A'}</td>
                      <td>
                        <span style={{ fontWeight: '700', color: parseInt(c.resume_score, 10) >= 80 ? '#2D6A4F' : '#8E3B46' }}>
                          {c.resume_score}/100
                        </span>
                      </td>
                      <td>
                        <span className="pill pill-blue">{c.predicted_field || 'General'}</span>
                      </td>
                      <td>
                        <span className="pill pill-green">{c.user_level || 'Fresher'}</span>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{c.timestamp}</td>
                      <td>
                        <button
                          className="btn-danger"
                          style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                          onClick={() => handleDeleteUser(c.id)}
                          title="Delete Candidate Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Distribution Visuals */}
      {activeTab === 'charts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card">
            <div className="sec-label">Career Field Distribution</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {metrics?.fieldDistribution &&
                Object.entries(metrics.fieldDistribution).map(([field, count]) => {
                  const pct = metrics.totalScans > 0 ? Math.round((count / metrics.totalScans) * 100) : 0;
                  return (
                    <div key={field} style={{ padding: '10px 14px', background: 'var(--bg-card-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{field}</span>
                        <span style={{ color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#8E3B46', borderRadius: '99px' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="card">
            <div className="sec-label">Candidate Experience Levels</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
              {metrics?.levelDistribution &&
                Object.entries(metrics.levelDistribution).map(([level, count]) => {
                  const pct = metrics.totalScans > 0 ? Math.round((count / metrics.totalScans) * 100) : 0;
                  return (
                    <div key={level} style={{ padding: '10px 14px', background: 'var(--bg-card-2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                        <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{level}</span>
                        <span style={{ color: 'var(--text-dim)' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '5px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#A07840', borderRadius: '99px' }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Feedback Oversight */}
      {activeTab === 'feedback' && (
        <div className="card">
          <div className="sec-label">Community Submissions Oversight</div>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Rating</th>
                  <th>Comments</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-dim)' }}>
                      No feedback submissions logged.
                    </td>
                  </tr>
                ) : (
                  feedbackList.map((f) => (
                    <tr key={f.id}>
                      <td style={{ fontWeight: '700', color: '#8E3B46' }}>#{f.id}</td>
                      <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{f.feed_name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{f.feed_email}</td>
                      <td style={{ color: '#A07840', fontWeight: 'bold' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>{f.feed_score}</span>
                          <Star size={12} fill="#A07840" color="#A07840" />
                        </div>
                      </td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {f.comments}
                      </td>
                      <td style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{f.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: PDF Library */}
      {activeTab === 'pdfs' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          <div className="card">
            <div className="sec-label">Stored Resume Files</div>
            {pdfs.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>No PDFs stored.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '500px', overflowY: 'auto' }}>
                {pdfs.map((p) => (
                  <button
                    key={p.filename}
                    onClick={() => setSelectedPdf(p.filename)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: selectedPdf === p.filename ? 'var(--primary-soft)' : 'var(--bg-card-2)',
                      border: `1px solid ${selectedPdf === p.filename ? 'var(--primary)' : 'var(--border)'}`,
                      color: selectedPdf === p.filename ? 'var(--primary)' : 'var(--text-body)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.8rem', fontWeight: '500' }}>
                      {p.filename}
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{p.sizeKb} KB</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div className="sec-label" style={{ margin: 0 }}>
                {selectedPdf ? `Viewing: ${selectedPdf}` : 'Select a File to Preview'}
              </div>

              {selectedPdf && (
                <a
                  href={`http://localhost:5000/uploads/${selectedPdf}`}
                  download={selectedPdf}
                  className="btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 12px' }}
                >
                  <Download size={13} />
                  <span>Download</span>
                </a>
              )}
            </div>

            {selectedPdf ? (
              <iframe
                src={`http://localhost:5000/uploads/${selectedPdf}`}
                width="100%"
                height="550"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', background: '#fff' }}
                title="Admin PDF Viewer"
              />
            ) : (
              <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
                Select a candidate PDF from the left list to view.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
