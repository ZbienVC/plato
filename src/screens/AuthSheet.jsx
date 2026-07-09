import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { auth } from '../lib/api';

// Shared glass/token styles matching the Elevated Verdant system.
const microLabel = {
  font: '600 10px var(--font-ui)', letterSpacing: '.14em',
  textTransform: 'uppercase', color: 'var(--sage)',
};
const fieldWrap = {
  display: 'flex', alignItems: 'center', gap: 10, height: 50, padding: '0 14px',
  borderRadius: 'var(--r-control, 16px)', background: 'var(--surface-2)',
  border: '1px solid var(--glass-border)',
};
const fieldInput = {
  flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none',
  color: 'var(--ink)', font: '500 15px var(--font-ui)',
};

function tabStyle(active) {
  return {
    flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
    font: '600 14px var(--font-ui)', transition: 'all .16s var(--ease-out)',
    color: active ? 'var(--on-accent)' : 'var(--sage)',
    background: active ? 'var(--primary)' : 'transparent',
  };
}

export function AuthSheet({ open, onClose, onSuccess }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const isSignup = mode === 'signup';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  // Password reset is not wired to a backend flow yet — no-op placeholder link.
  const handleForgot = () => { /* TODO: wire to auth reset flow */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      if (isSignup) {
        await auth.signup(email, password, username || undefined);
      } else {
        await auth.login(email, password);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'something went wrong. please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          borderRadius: '28px 28px 0 0',
          background: 'var(--sheet-fill, var(--glass-fill))',
          border: '1px solid var(--glass-border)', borderBottom: 'none',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 -20px 50px -20px rgba(0,0,0,.8)',
          padding: '12px 22px 30px',
        }}
      >
        {/* grab handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 14 }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--divider-strong)' }} />
        </div>

        {/* segmented tabs */}
        <div style={{
          display: 'flex', background: 'var(--surface-2)', borderRadius: 13,
          padding: 4, gap: 3, marginBottom: 20,
        }}>
          <button type="button" onClick={() => switchMode('signup')} style={tabStyle(isSignup)}>sign up</button>
          <button type="button" onClick={() => switchMode('login')} style={tabStyle(!isSignup)}>log in</button>
        </div>

        {/* username (signup only, optional) */}
        {isSignup && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...microLabel, marginBottom: 7 }}>name</div>
            <div style={fieldWrap}>
              <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><User size={18} /></span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your name (optional)"
                autoComplete="name"
                style={fieldInput}
              />
            </div>
          </div>
        )}

        {/* email */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ ...microLabel, marginBottom: 7 }}>email</div>
          <div style={fieldWrap}>
            <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Mail size={18} /></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              autoComplete="email"
              style={fieldInput}
            />
          </div>
        </div>

        {/* password */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
            <div style={microLabel}>password</div>
            {!isSignup && (
              <button
                type="button"
                onClick={handleForgot}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', font: '600 11px var(--font-ui)', cursor: 'pointer' }}
              >forgot password?</button>
            )}
          </div>
          <div style={fieldWrap}>
            <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Lock size={18} /></span>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 6 characters"
              required
              minLength={6}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              style={fieldInput}
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'hide password' : 'show password'}
              style={{ background: 'none', border: 'none', color: 'var(--sage)', cursor: 'pointer', display: 'inline-flex' }}
            >{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>

        {/* inline error */}
        {error && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 'var(--r-control, 16px)',
            background: 'rgba(225,97,108,.12)', border: '1px solid rgba(225,97,108,.28)',
            color: 'var(--danger)', font: '500 13px var(--font-ui)', textAlign: 'center', lineHeight: 1.4,
          }}>{error}</div>
        )}

        {/* primary */}
        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 20, width: '100%', height: 54, border: 'none',
            borderRadius: 'var(--r-control, 16px)',
            background: 'linear-gradient(135deg,#43C6AC,#0F9482)',
            color: 'var(--on-accent, #04231C)', font: '700 16px var(--font-ui)',
            cursor: loading ? 'default' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '0 14px 34px -16px rgba(67,198,172,.7)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'just a sec…' : isSignup ? 'create account' : 'log in'}
        </button>

        {/* continue without account */}
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => onClose?.()}
            style={{ background: 'none', border: 'none', color: 'var(--sage)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}
          >continue without an account</button>
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', font: '400 11px var(--font-ui)', color: 'var(--muted)', lineHeight: 1.5 }}>
          by continuing you agree to our terms &amp; privacy policy
        </div>
      </form>
    </div>
  );
}
