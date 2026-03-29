import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Lock, Sparkles, ArrowUpRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const benefits = [
  { title: 'Voice Log AI', detail: 'Speak meals + auto macros in seconds.' },
  { title: 'Restaurant Mode', detail: 'Auto macros for 200+ chains and hidden menus.' },
  { title: 'Concierge Swaps', detail: 'Tap to smart-swap meals without breaking macros.' },
];

export function PremiumPaywallModal({ open, onClose, showToast }) {
  const {
    premium,
    startTrial,
    activatePremium,
    premiumCheckoutUrl,
    premiumContactEmail,
    closePremiumModal,
  } = useApp();

  const [email, setEmail] = useState(premium?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkoutConfigured = useMemo(() => Boolean(premiumCheckoutUrl), [premiumCheckoutUrl]);

  useEffect(() => {
    if (open) {
      setEmail(premium?.email || '');
      setError('');
    }
  }, [open, premium?.email]);

  const dismiss = () => {
    setLoading(false);
    onClose?.();
    closePremiumModal();
  };

  const handleStartTrial = async () => {
    if (!email) {
      setError('Email required to start your trial');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await startTrial(email);
      showToast?.('48h Premium trial unlocked', 'success', 2800);
      if (checkoutConfigured) {
        window.open(premiumCheckoutUrl, '_blank', 'noopener,noreferrer');
      } else {
        showToast?.(`Email ${premiumContactEmail} to finalize billing`, 'info', 3600);
      }
      dismiss();
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Could not start trial';
      setError(msg);
      showToast?.(msg, 'error', 2800);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!email) {
      setError('Email required to unlock');
      return;
    }
    const confirmed = window.confirm('Already paid? Unlock Premium on this device?');
    if (!confirmed) return;
    setLoading(true);
    setError('');
    try {
      await activatePremium(email);
      showToast?.('Premium unlocked — welcome back!', 'success', 2600);
      dismiss();
    } catch (err) {
      const msg = err?.message || 'Unable to unlock premium';
      setError(msg);
      showToast?.(msg, 'error', 2600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/70 backdrop-blur-sm px-4 pb-6"
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-green-500">Plato Premium</p>
                <h3 className="text-xl font-black text-slate-900">Unlock Voice & Restaurant Mode</h3>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              {benefits.map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {!checkoutConfigured && (
              <div className="mb-4 rounded-2xl border border-dashed border-amber-200 bg-amber-50/60 px-4 py-3">
                <p className="text-xs font-semibold text-amber-700">
                  Stripe checkout link not configured yet. Email <span className="underline">{premiumContactEmail}</span> to finalize billing after your trial.
                </p>
              </div>
            )}

            <label className="text-xs font-semibold text-slate-500 mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 focus:border-green-400 focus:ring-2 focus:ring-green-100"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            <button
              onClick={handleStartTrial}
              disabled={loading}
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200/60 disabled:opacity-60"
            >
              {loading ? 'Activating trial…' : 'Start 48h free trial'}
            </button>

            <button
              onClick={handleUnlock}
              disabled={loading}
              className="mt-3 w-full rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Already upgraded? Unlock now
            </button>

            <button
              onClick={dismiss}
              className="mt-4 w-full text-xs font-semibold text-slate-400 flex items-center justify-center gap-1"
            >
              Close
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
