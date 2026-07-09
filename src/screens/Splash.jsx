import React from 'react';

/**
 * App launch splash — the icon scales in over the verdant mesh, the
 * wordmark + tagline settle, and an indeterminate bar loads the app.
 * Shown briefly on load, then App swaps to the real first screen.
 */
export function Splash() {
  return (
    <div
      style={{
        position: 'relative', width: '100%', maxWidth: 'var(--content-max)', margin: '0 auto',
        height: '100dvh', background: 'var(--page-bg)', overflow: 'hidden',
        display: 'flex', flexDirection: 'column', color: 'var(--ink)', fontFamily: 'var(--font-ui)',
      }}
    >
      <style>{`
        @keyframes sp-halo { from { opacity:0; transform: scale(.5); } to { opacity:1; transform: scale(1); } }
        @keyframes sp-pop { 0% { opacity:0; transform: scale(.7); } 60% { opacity:1; transform: scale(1.045); } 100% { opacity:1; transform: scale(1); } }
        @keyframes sp-breathe { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-3px) scale(1.02); } }
        @keyframes sp-fade { from { opacity:0; transform: translateY(9px); } to { opacity:1; transform: translateY(0); } }
        @keyframes sp-bar { 0% { transform: translateX(-115%); } 100% { transform: translateX(300%); } }
        @media (prefers-reduced-motion: reduce) { .sp * { animation-duration:.001ms !important; animation-iteration-count:1 !important; } }
      `}</style>

      {/* grain */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 'var(--grain-op)', mixBlendMode: 'overlay', backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='3' height='3'%3E%3Ccircle cx='1' cy='1' r='.5' fill='white'/%3E%3C/svg%3E\")", backgroundSize: '3px 3px' }} />

      <div className="sp" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(67,198,172,.10),transparent 66%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -30, borderRadius: '50%', background: 'radial-gradient(circle,rgba(67,198,172,.34),transparent 66%)', filter: 'blur(8px)', animation: 'sp-halo .85s var(--ease-out) .1s both' }} />
            <img src="/plato-logo.png" alt="Plato" width="112" height="112"
              style={{ position: 'relative', display: 'block', width: 112, height: 112, borderRadius: 30, transformOrigin: 'center', boxShadow: '0 30px 70px -22px rgba(0,0,0,.72),0 0 42px -8px rgba(67,198,172,.42)', animation: 'sp-pop .75s var(--ease-out) both, sp-breathe 5.5s ease-in-out 1.15s infinite' }} />
          </div>
          <div style={{ marginTop: 28, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 38, letterSpacing: '-.03em', color: 'var(--ink)', animation: 'sp-fade .6s var(--ease-out) .28s both' }}>Plato</div>
          <div style={{ marginTop: 7, font: '500 14px var(--font-ui)', color: 'var(--sage)', animation: 'sp-fade .6s var(--ease-out) .4s both' }}>your AI nutrition companion</div>
        </div>
      </div>

      <div className="sp" style={{ flex: 'none', padding: '0 24px 46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
        <div style={{ width: 150, height: 4, borderRadius: 999, background: 'var(--hairline)', overflow: 'hidden', position: 'relative', animation: 'sp-fade .6s var(--ease-out) .55s both' }}>
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '38%', borderRadius: 999, background: 'linear-gradient(90deg,#5FD4C4,#43C6AC)', boxShadow: '0 0 10px rgba(67,198,172,.6)', animation: 'sp-bar 1.35s ease-in-out infinite' }} />
        </div>
        <div style={{ font: '600 10px var(--font-ui)', letterSpacing: '.18em', textTransform: 'uppercase', color: 'var(--muted)', animation: 'sp-fade .6s var(--ease-out) .6s both' }}>version 2.0.0</div>
      </div>
    </div>
  );
}
