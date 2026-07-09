import React from 'react';

/**
 * App-wide crash boundary (the SystemStates "error" surface). Catches
 * render errors and shows a friendly, on-brand fallback instead of a
 * white screen.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('Plato crashed:', error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{
        minHeight: '100dvh', width: '100%', maxWidth: 'var(--content-max)', margin: '0 auto',
        background: 'var(--page-bg)', color: 'var(--ink)', fontFamily: 'var(--font-ui)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: 32, gap: 8,
      }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(225,97,108,.14)', border: '1px solid rgba(225,97,108,.28)', marginBottom: 8 }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24, letterSpacing: '-.02em' }}>Plato hit a snag</div>
        <div style={{ font: '500 14px var(--font-ui)', color: 'var(--sage)', maxWidth: 300, lineHeight: 1.5 }}>Something went wrong on this screen. Reloading usually clears it.</div>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 18, height: 50, padding: '0 28px', borderRadius: 'var(--r-control)', border: 'none', cursor: 'pointer', background: 'linear-gradient(140deg,#5EEAD4,#0F9482)', color: '#04231C', font: '700 15px var(--font-ui)', boxShadow: '0 16px 32px -14px rgba(67,198,172,.55)' }}
        >Reload Plato</button>
      </div>
    );
  }
}
