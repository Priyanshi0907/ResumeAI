import React from 'react';

export default function ScoreGauge({ score = 0, size = 180, strokeWidth = 10, label = 'ATS Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedScore = Math.min(100, Math.max(0, score));
  const offset = circumference - (clampedScore / 100) * circumference;

  let color = '#C0392B';
  let message = 'Needs Work';
  if (clampedScore >= 80) {
    color = '#2D6A4F';
    message = 'Excellent';
  } else if (clampedScore >= 50) {
    color = '#A07840';
    message = 'Good';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated Value Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-in-out, stroke 0.5s ease' }}
          />
        </svg>

        {/* Center Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: `${size * 0.24}px`, fontWeight: '800', color: 'var(--text-main)', lineHeight: 1 }}>
            {clampedScore}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: '3px', fontWeight: '600' }}>
            / 100
          </div>
        </div>
      </div>

      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color }}>{message}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{label}</div>
      </div>
    </div>
  );
}
