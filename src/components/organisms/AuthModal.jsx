import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Loader2 } from 'lucide-react';
import { auth } from '../../lib/api';

export function AuthModal({ open, onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode when initialMode prop changes (e.g. opened from 'signup' button)
  React.useEffect(() => { setMode(initialMode); }, [initialMode]);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await auth.signup(email, password, username || undefined);
      } else {
        await auth.login(email, password);
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const toggle = () => {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {mode === 'login' ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  {mode === 'login'
                    ? 'Sign in to sync your logs across devices'
                    : 'Start tracking your nutrition for free'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="Username (optional)"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 text-center bg-red-50 rounded-xl px-3 py-2">{error}</p>
              )}

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-green-500 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </motion.button>

              <p className="text-center text-xs text-slate-400 pt-1">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button
                  type="button"
                  onClick={toggle}
                  className="text-green-600 font-semibold hover:text-green-700"
                >
                  {mode === 'login' ? 'Sign up free' : 'Sign in'}
                </button>
              </p>
            </form>

            {/* Continue without account */}
            <div className="px-6 pb-6">
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors"
              >
                Continue without an account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
