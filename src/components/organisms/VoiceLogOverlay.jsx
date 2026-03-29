import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, MicOff, X, Check, RotateCcw } from 'lucide-react';
import { useVoiceInput } from '../../hooks/useVoiceInput';

const SLOT_OPTIONS = ['breakfast', 'lunch', 'dinner', 'snack'];

function inferSlotFromSpeech(text = '') {
  const lower = text.toLowerCase();
  if (lower.includes('breakfast') || lower.includes('morning')) return 'breakfast';
  if (lower.includes('lunch') || lower.includes('midday')) return 'lunch';
  if (lower.includes('dinner') || lower.includes('evening')) return 'dinner';
  if (lower.includes('snack')) return 'snack';
  return null;
}

function inferSlotFromTime(date = new Date()) {
  const hour = date.getHours();
  if (hour < 11) return 'breakfast';
  if (hour < 16) return 'lunch';
  if (hour < 21) return 'dinner';
  return 'snack';
}

function extractMacros(text = '') {
  const macros = {};
  const calorieRegex = /([0-9]+(?:\.[0-9]+)?)\s*(?:k?cal(?:ories)?|cal)/gi;
  let match;
  while ((match = calorieRegex.exec(text)) !== null) {
    macros.calories = Math.round(parseFloat(match[1]));
  }

  const macroRegex = /([0-9]+(?:\.[0-9]+)?)\s*(?:g\s*)?(protein|carbs?|fat)s?/gi;
  while ((match = macroRegex.exec(text)) !== null) {
    const value = Math.round(parseFloat(match[1]));
    const key = match[2].toLowerCase();
    if (key.startsWith('protein')) macros.protein = value;
    if (key.startsWith('carb')) macros.carbs = value;
    if (key.startsWith('fat')) macros.fat = value;
  }

  return macros;
}

function formatMealName(text = '') {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Voice meal';
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function VoiceLogOverlay({ onClose, onSave, onSuccess }) {
  const { isListening, transcript, startListening, stopListening, error } = useVoiceInput();
  const [manualText, setManualText] = useState('');
  const [form, setForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    slot: inferSlotFromTime(),
  });
  const [mode, setMode] = useState('idle');
  const [parsing, setParsing] = useState(false);
  const speechSupported = useMemo(() => typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window), []);

  useEffect(() => () => stopListening(), [stopListening]);

  useEffect(() => {
    if (!isListening && transcript) {
      handleParse(transcript);
    }
  }, [isListening, transcript]);

  const handleParse = async (text) => {
    if (!text?.trim()) return;
    setParsing(true);
    const macros = extractMacros(text);
    const slot = inferSlotFromSpeech(text) || form.slot || inferSlotFromTime();
    setManualText(text);
    setForm(prev => ({
      ...prev,
      name: formatMealName(text),
      slot,
      calories: macros.calories ?? prev.calories ?? '',
      protein: macros.protein ?? prev.protein ?? '',
      carbs: macros.carbs ?? prev.carbs ?? '',
      fat: macros.fat ?? prev.fat ?? '',
    }));
    setMode('review');
    setParsing(false);
  };

  const handleReset = () => {
    setManualText('');
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '', slot: inferSlotFromTime() });
    setMode('idle');
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      slot: form.slot,
      type: form.slot,
      source: 'voice',
      notes: manualText.trim(),
    };
    await Promise.resolve(onSave?.(payload));
    onSuccess?.();
  };

  const closeOverlay = () => {
    stopListening();
    onClose?.();
  };

  const disableSave = !form.name.trim() || parsing;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={closeOverlay} />
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-[400px] px-5"
        >
          <div className="bg-white rounded-3xl p-5 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-green-500 uppercase tracking-wider">Voice Logger</p>
                <h2 className="text-xl font-bold text-slate-900">Speak your meal</h2>
              </div>
              <button onClick={closeOverlay} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="app-card flex items-center gap-4">
              <button
                onClick={() => (isListening ? stopListening() : startListening())}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isListening ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'}`}
              >
                {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{isListening ? 'Listening…' : 'Tap to start recording'}</p>
                <p className="text-xs text-slate-500">{speechSupported ? 'Describe what you ate and include calories/macros if you know them.' : 'Speech not supported. Type your meal below.'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transcript</p>
                {manualText && (
                  <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={3}
                placeholder={speechSupported ? '"Grilled chicken with rice and broccoli, about 520 calories"' : 'Type your meal, e.g. "Avocado toast with 2 eggs, 420 calories, 20g protein"'}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
              />
              <div className="flex gap-2 mt-2">
                <button onClick={() => handleParse(manualText)} disabled={!manualText.trim() || parsing}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${manualText.trim() ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {parsing ? 'Parsing…' : 'Parse text'}
                </button>
                <button onClick={() => setMode('review')} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-semibold">
                  Edit Manually
                </button>
              </div>
            </div>

            {mode === 'review' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meal name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Meal title"
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meal slot</label>
                  <select
                    value={form.slot}
                    onChange={(e) => setForm(prev => ({ ...prev, slot: e.target.value }))}
                    className="mt-1 w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                  >
                    {SLOT_OPTIONS.map(option => (
                      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Macros</label>
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[
                      { key: 'calories', label: 'Cal' },
                      { key: 'protein', label: 'Protein' },
                      { key: 'carbs', label: 'Carbs' },
                      { key: 'fat', label: 'Fat' },
                    ].map(field => (
                      <div key={field.key}>
                        <input
                          type="number"
                          value={form[field.key]}
                          onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                          placeholder="0"
                          className="w-full px-2 py-2 rounded-xl border border-slate-200 bg-white text-center text-sm text-slate-900 outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100"
                        />
                        <p className="text-[10px] text-slate-400 text-center mt-1">{field.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={disableSave}
              className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${disableSave ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-green-500 text-white'}`}
            >
              <Check className="w-4 h-4" /> Log Meal
            </button>
            {error && (
              <p className="text-xs text-rose-500 text-center">{error === 'not-allowed' ? 'Microphone permission blocked in browser settings.' : `Voice error: ${error}`}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
