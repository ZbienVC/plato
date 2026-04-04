import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthModal } from '../components/organisms/AuthModal';

interface WelcomeScreenProps {
  onContinueAsGuest: () => void;
  onAuthSuccess: () => void;
}

export function WelcomeScreen({ onContinueAsGuest, onAuthSuccess }: WelcomeScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #0B1220 0%, #0f1e35 40%, #0B1220 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow blobs */}
      <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(16,217,160,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '-10%', width: 400, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}
      >
        {/* Logo / Brand */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #10d9a0, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 0 40px rgba(16,217,160,0.25)',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
              <line x1="6" y1="1" x2="6" y2="4"/>
              <line x1="10" y1="1" x2="10" y2="4"/>
              <line x1="14" y1="1" x2="14" y2="4"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-1px', margin: 0 }}>
            <span style={{ background: 'linear-gradient(135deg, #10d9a0, #6eb4f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Plato
            </span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 8, letterSpacing: '0.01em' }}>
            Your AI nutrition companion
          </p>
        </div>

        {/* Feature highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 40 }}>
          {[
            { icon: 'â—Ž', label: 'Track macros in seconds', color: '#10d9a0' },
            { icon: 'â—ˆ', label: 'AI-powered meal plans', color: '#6366f1' },
            { icon: 'â—‡', label: 'Real food database (USDA)', color: '#6eb4f7' },
          ].map(({ icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12, padding: '12px 16px',
              textAlign: 'left',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: `${color}18`,
                border: `1px solid ${color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color, fontSize: 16, flexShrink: 0,
              }}>{icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setAuthMode('signup')}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 14, border: 'none',
              background: 'linear-gradient(135deg, #10d9a0, #0ea875)',
              color: '#0B1220', fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(16,217,160,0.3)',
              letterSpacing: '-0.01em',
            }}
          >
            Get started â€” it&apos;s free
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setAuthMode('login')}
            style={{
              width: '100%', padding: '15px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)', fontSize: 16, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign in to your account
          </motion.button>

          <button
            onClick={onContinueAsGuest}
            style={{
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: 13,
              cursor: 'pointer', padding: '8px',
              letterSpacing: '0.01em',
            }}
          >
            Continue without an account
          </button>
        </div>
      </motion.div>

      {/* Auth Modal */}
      <AuthModal
        open={authMode !== null}
        initialMode={authMode || 'login'}
        onClose={() => setAuthMode(null)}
        onSuccess={() => { setAuthMode(null); onAuthSuccess(); }}
      />
    </div>
  );
}
