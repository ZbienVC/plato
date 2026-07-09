import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { auth, requestPasswordReset, confirmPasswordReset } from '../lib/api';

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
  const [mode, setMode] = useState('signup'); // 'signup' | 'login' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password reset flow state.
  const [resetSent, setResetSent] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);

  if (!open) return null;

  const isSignup = mode === 'signup';
  const isReset = mode === 'reset';

  const switchMode = (next) => {
    setMode(next);
    setError('');
  };

  // Enter the reset view from the "forgot password?" link.
  const handleForgot = () => {
    setMode('reset');
    setError('');
    setResetSent(false);
    setResetToken('');
    setNewPassword('');
    setShowNewPw(false);
  };

  // Return to the log in view from the reset flow.
  const backToSignIn = () => {
    setMode('login');
    setError('');
    setResetSent(false);
    setResetToken('');
    setNewPassword('');
  };

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

  // Step 1 of reset: request a reset link for the entered email.
  const handleRequestReset = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setResetSent(true);
      // In dev / unconfigured-mail mode a devToken is returned so the flow
      // can be completed end-to-end without a real email.
      if (res?.devToken) setResetToken(res.devToken);
    } catch (err) {
      setError(err?.message || 'something went wrong. please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 of reset (dev mode only): confirm the token + new password.
  const handleConfirmReset = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await confirmPasswordReset(resetToken, newPassword);
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err?.message || 'could not reset password. please try again.');
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
        onSubmit={isReset ? (resetToken ? handleConfirmReset : handleRequestReset) : handleSubmit}
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

        {isReset ? (
          <>
            {/* reset header */}
            <div style={{ marginBottom: 18 }}>
              <button
                type="button"
                onClick={backToSignIn}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--sage)', font: '600 13px var(--font-ui)', padding: 0, marginBottom: 12,
                }}
              ><ArrowLeft size={16} /> back to sign in</button>
              <div style={{ font: '700 20px var(--font-ui)', color: 'var(--ink)', marginBottom: 4 }}>reset password</div>
              <div style={{ font: '400 13px var(--font-ui)', color: 'var(--muted)', lineHeight: 1.5 }}>
                enter your email and we'll send you a reset link.
              </div>
            </div>

            {/* reset email */}
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
                  disabled={resetSent}
                  style={{ ...fieldInput, opacity: resetSent ? 0.6 : 1 }}
                />
              </div>
            </div>

            {/* confirmation once a request has been sent */}
            {resetSent && (
              <div style={{
                marginTop: 4, padding: '11px 14px', borderRadius: 'var(--r-control, 16px)',
                background: 'rgba(67,198,172,.12)', border: '1px solid rgba(67,198,172,.28)',
                color: 'var(--ink)', font: '500 13px var(--font-ui)', textAlign: 'center', lineHeight: 1.4,
              }}>if that email exists, we sent a reset link.</div>
            )}

            {/* dev-mode: token + new password to test the flow end-to-end */}
            {resetSent && resetToken && (
              <>
                <div style={{ marginTop: 16 }}>
                  <div style={{ ...microLabel, marginBottom: 7 }}>reset token</div>
                  <div style={fieldWrap}>
                    <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><KeyRound size={18} /></span>
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      placeholder="paste your reset token"
                      required
                      autoComplete="off"
                      style={fieldInput}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ ...microLabel, marginBottom: 7 }}>new password</div>
                  <div style={fieldWrap}>
                    <span style={{ color: 'var(--sage)', display: 'inline-flex' }}><Lock size={18} /></span>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="at least 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      style={fieldInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw((s) => !s)}
                      aria-label={showNewPw ? 'hide password' : 'show password'}
                      style={{ background: 'none', border: 'none', color: 'var(--sage)', cursor: 'pointer', display: 'inline-flex' }}
                    >{showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
        <>
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
        </>
        )}

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
          {loading
            ? 'just a sec…'
            : isReset
              ? (resetToken ? 'set new password' : 'send reset link')
              : isSignup ? 'create account' : 'log in'}
        </button>

        {isReset ? (
          /* back to sign in (secondary link in reset flow) */
          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <button
              type="button"
              onClick={backToSignIn}
              style={{ background: 'none', border: 'none', color: 'var(--sage)', font: '600 13px var(--font-ui)', cursor: 'pointer' }}
            >back to sign in</button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </form>
    </div>
  );
}
