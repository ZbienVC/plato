import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthModal } from '../components/organisms/AuthModal';
import { Zap, Brain, Database } from 'lucide-react';
import PlatoMark from '../components/brand/PlatoMark';

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
      background: 'radial-gradient(ellipse at top, #0d1b3e 0%, #080d1a 60%)',
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
            width: 88, height: 88,
            margin: '0 auto 20px',
            borderRadius: 24,
            boxShadow: '0 14px 40px rgba(0,0,0,0.45), 0 4px 14px rgba(60,125,44,0.4)',
          }}>
            <PlatoMark size={88} rounded />
          </div>

          <h1 style={{
            fontSize: 40, fontWeight: 900, letterSpacing: '-1.5px',
            margin: '0 0 8px',
            background: 'linear-gradient(135deg, #6FE6A8, #34E89E 55%, #14B877)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Plato
          </h1>
          <p style={{ color: '#94a3b8', fontSize: 16, margin: 0, fontWeight: 500 }}>
            Your AI nutrition companion
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 36 }}>
          {features.map(({ Icon, label, color }) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '14px 16px',
              textAlign: 'left',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: `${color}22`,
                border: `1px solid ${color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={18} color={color} />
              </div>
              <span style={{ color: '#E6EAF2', fontSize: 15, fontWeight: 600 }}>{label}</span>
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
              background: 'linear-gradient(135deg, #34E89E, #059669)',
              color: '#04140C', fontSize: 16, fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 6px 24px rgba(52,232,158,0.35)',
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
              background: 'rgba(255,255,255,0.05)',
              border: '1.5px solid rgba(255,255,255,0.14)',
              color: '#E6EAF2', fontSize: 16, fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
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
