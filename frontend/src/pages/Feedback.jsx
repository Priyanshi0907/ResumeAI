import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Star, Trash2, CheckCircle2, AlertCircle, User } from 'lucide-react';

export default function Feedback() {
  const { user, isLoggedIn } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [formData, setFormData] = useState({
    feed_name: '',
    feed_email: '',
    feed_score: 5,
    comments: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Pre-fill name/email from logged-in user
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        feed_name: prev.feed_name || user.name || '',
        feed_email: prev.feed_email || user.email || '',
      }));
    }
  }, [user]);

  const fetchFeedback = async () => {
    try {
      const res = await feedbackApi.getAll();
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Fetch feedback error:', err);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.feed_name.trim() || !formData.feed_email.trim()) {
      setErrorMessage('Name and email are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setMessage('');

    try {
      const res = await feedbackApi.create(formData);
      if (res.data.success) {
        setMessage('Thank you! Your feedback has been recorded.');
        setFormData(prev => ({
          feed_name: user?.name || '',
          feed_email: user?.email || '',
          feed_score: 5,
          comments: '',
        }));
        fetchFeedback();
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (err) {
      setErrorMessage('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    setDeletingId(id);
    try {
      const res = await feedbackApi.delete(id);
      if (res.data.success) {
        fetchFeedback();
      }
    } catch (err) {
      console.error(err);
      alert('Could not delete review. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  // Compute average score & distribution
  const totalReviews = reviews.length;
  let avgScore = 0;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => {
      const s = Math.round(parseFloat(r.feed_score) || 5);
      if (starCounts[s] !== undefined) starCounts[s] += 1;
      return acc + (parseFloat(r.feed_score) || 5);
    }, 0);
    avgScore = Math.round((sum / totalReviews) * 10) / 10;
  }

  const renderStars = (score, size = 14) => {
    const s = Math.round(score);
    return (
      <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            fill={i <= s ? '#A07840' : 'none'}
            color={i <= s ? '#A07840' : 'var(--border-strong)'}
          />
        ))}
      </div>
    );
  };

  // Generate initials avatar color from name
  const avatarColor = (name = '') => {
    const colors = [
      '#8E3B46', '#4A6FA5', '#2D6A4F', '#6B4C8A', '#C05621',
      '#1A6B7A', '#7A6B1A', '#5C3D2E', '#3D5C4E', '#4E3D7A',
    ];
    let hash = 0;
    for (const c of name) hash = (hash << 5) - hash + c.charCodeAt(0);
    return colors[Math.abs(hash) % colors.length];
  };

  const initials = (name = '') =>
    name.trim().split(/\s+/).map(w => w[0]?.toUpperCase() || '').join('').slice(0, 2) || '?';

  // Check if current user owns a review
  const isOwner = (review) => {
    if (!isLoggedIn || !user) return false;
    // Match by user_id (preferred) or fall back to email match
    if (review.user_id && user.id) return review.user_id === user.id;
    return review.feed_email?.toLowerCase() === user.email?.toLowerCase();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <span className="eyebrow">Community Reviews</span>
        <h1 className="page-title">Candidate &amp; Recruiter Feedback</h1>
        <p className="page-subtitle">
          Your reviews and ratings help us continuously refine domain heuristics, ATS scoring models, and LLM tailored prompts.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        {/* Submit Form */}
        <div className="card">
          <div className="sec-label">
            <MessageSquare size={14} color="#8E3B46" />
            <span>Submit Your Experience</span>
          </div>

          {message && (
            <div style={{ background: 'rgba(45,106,79,0.08)', border: '1px solid rgba(45,106,79,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#2D6A4F', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          {errorMessage && (
            <div style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: '8px', padding: '10px 14px', color: '#C0392B', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Priya Sharma"
                value={formData.feed_name}
                onChange={(e) => setFormData({ ...formData, feed_name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-input"
                placeholder="priya@domain.com"
                value={formData.feed_email}
                onChange={(e) => setFormData({ ...formData, feed_email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Overall Rating</label>
              <div style={{ display: 'flex', gap: '6px', margin: '6px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                    onClick={() => setFormData({ ...formData, feed_score: star })}
                  >
                    <Star
                      size={20}
                      fill={formData.feed_score >= star ? '#A07840' : 'none'}
                      color={formData.feed_score >= star ? '#A07840' : 'var(--border-strong)'}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Review Comments</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Share your experience, feature ideas, or interview feedback..."
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={isSubmitting}
            >
              <span>{isSubmitting ? 'Recording...' : 'Record Community Feedback'}</span>
            </button>
          </form>
        </div>

        {/* Rating Breakdown */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="sec-label">Community Rating Summary</div>

          <div style={{ textAlign: 'center', padding: '16px 0 20px 0' }}>
            <div style={{ fontSize: '3.4rem', fontWeight: '900', color: '#A07840', lineHeight: 1 }}>
              {avgScore.toFixed(1)}
            </div>
            <div style={{ margin: '8px 0' }}>{renderStars(avgScore, 18)}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
              Based on {totalReviews} community submission{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.78rem' }}>
                  <span style={{ width: '28px', color: 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {star} <Star size={11} fill="#A07840" color="#A07840" />
                  </span>
                  <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#8E3B46', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ width: '36px', color: 'var(--text-dim)', textAlign: 'right' }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews Feed */}
      <div>
        <div className="sec-label" style={{ marginBottom: '16px' }}>
          Latest Community Reviews ({reviews.length})
        </div>

        {reviews.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '32px' }}>
            No reviews submitted yet. Be the first to record your rating above!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => {
              const owned = isOwner(r);
              const color = avatarColor(r.feed_name);
              const ini = initials(r.feed_name);

              return (
                <div
                  key={r.id}
                  className="card"
                  style={{
                    padding: '16px 20px',
                    border: owned ? '1px solid rgba(142,59,70,0.3)' : undefined,
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Avatar + content */}
                    <div style={{ display: 'flex', gap: '14px', flex: 1, minWidth: 0 }}>
                      {/* Avatar */}
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: '700', flexShrink: 0,
                        letterSpacing: '0.5px',
                      }}>
                        {ini}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                            {r.feed_name}
                          </span>
                          {renderStars(parseFloat(r.feed_score) || 5, 13)}
                          {owned && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: '700', padding: '1px 7px',
                              background: 'rgba(142,59,70,0.1)', color: '#8E3B46',
                              borderRadius: '99px', border: '1px solid rgba(142,59,70,0.2)',
                              letterSpacing: '0.4px',
                            }}>
                              YOUR REVIEW
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-body)', lineHeight: '1.55', marginTop: '4px' }}>
                          {r.comments || 'No written comment provided.'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '6px' }}>
                          {r.timestamp?.replace('_', ' ') || ''}
                        </div>
                      </div>
                    </div>

                    {/* Delete button — only for owner */}
                    {owned && (
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 10px', fontSize: '0.75rem', flexShrink: 0, opacity: deletingId === r.id ? 0.5 : 1 }}
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        title="Delete your review"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
