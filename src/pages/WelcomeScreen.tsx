import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthModal } from '../components/organisms/AuthModal';
import { Zap, Brain, Database } from 'lucide-react';

interface WelcomeScreenProps {
  onContinueAsGuest: () => void;
  onAuthSuccess: () => void;
}

export function WelcomeScreen({ onContinueAsGuest, onAuthSuccess }: WelcomeScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  const features = [
    { Icon: Zap, label: 'Track macros in seconds', color: '#10b981' },
    { Icon: Brain, label: 'AI-powered meal plans', color: '#6366f1' },
    { Icon: Database, label: 'Real food database (USDA)', color: '#0ea5e9' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #f0fdf4 0%, #eff6ff 50%, #faf5ff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle bg blobs */}
      <div style={{ position: 'absolute', top: '10%', right: '-5%', width: 300, height: 300, background: 'radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', left: '-5%', width: 250, height: 250, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: '100%', maxWidth: 360, textAlign: 'center' }}
      >
        {/* App Icon */}
        <div style={{ marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'linear-gradient(135deg, #10b981, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>

          <h1 style={{
            fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px',
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #10b981, #6366f1)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Plato
          </h1>
          <p style={{ color: '#64748b', fontSize: 16, margin: 0, fontWeight: 500 }}>
            Your AI nutrition companion
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
          {features.map(({ Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'white',
              border: '1px solid rgba(15,23,42,0.07)',
              borderRadius: 14, padding: '14px 16px',
              textAlign: 'left',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${color}15`,
                border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ color: '#1e293b', fontSize: 15, fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setAuthMode('signup')}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff', fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
              letterSpacing: '-0.01em',
            }}
          >
            Get started free
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setAuthMode('login')}
            style={{
              width: '100%', padding: '16px',
              borderRadius: 14,
              background: 'white',
              border: '1.5px solid rgba(15,23,42,0.12)',
              color: '#1e293b', fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            Sign in to your account
          </motion.button>

          <button
            onClick={onContinueAsGuest}
            style={{
              background: 'none', border: 'none',
              color: '#94a3b8', fontSize: 14,
              cursor: 'pointer', padding: '10px',
            }}
          >
            Continue without an account
          </button>
        </div>
      </motion.div>

      <AuthModal
        open={authMode !== null}
        initialMode={authMode || 'login'}
        onClose={() => setAuthMode(null)}
        onSuccess={() => { setAuthMode(null); onAuthSuccess(); }}
      />
    </div>
  );
}
