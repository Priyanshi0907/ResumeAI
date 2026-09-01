import React, { useState, useEffect } from 'react';
import { FileText, Search, Brain, Target, BarChart3, CheckCircle2, Cpu } from 'lucide-react';

const STEPS = [
  { icon: <FileText size={18} />, label: 'Parsing resume PDF layout...' },
  { icon: <Search size={18} />, label: 'Extracting sections and structural elements...' },
  { icon: <Brain size={18} />, label: 'Running NLP & spaCy skill matches...' },
  { icon: <Target size={18} />, label: 'Predicting professional career field...' },
  { icon: <BarChart3 size={18} />, label: 'Calculating ATS section score...' },
  { icon: <CheckCircle2 size={18} />, label: 'Structuring dashboard recommendations...' },
];

export default function PipelineLoader({ onComplete }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          const next = prev + 1;
          setProgress(Math.round(((next + 1) / STEPS.length) * 100));
          return next;
        }
        clearInterval(interval);
        if (onComplete) onComplete();
        return prev;
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="card" style={{ padding: '24px 28px', maxWidth: '600px', margin: '30px auto' }}>
      <div className="sec-label" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Cpu size={14} color="#8E3B46" />
        <span>Running NLP Pipeline</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              background: 'var(--primary-soft)',
              border: '1px solid rgba(142,59,70,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8E3B46',
            }}
          >
            {currentStep.icon}
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {currentStep.label}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              Step {currentStepIndex + 1} of {STEPS.length}
            </div>
          </div>
        </div>

        <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#8E3B46' }}>
          {progress}%
        </div>
      </div>

      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: '#8E3B46',
            borderRadius: '99px',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
