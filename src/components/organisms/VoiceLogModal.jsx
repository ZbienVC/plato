import React, { useState, useEffect, useRef } from 'react';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { Button } from '../atoms/Button';
import { computeMealMacrosFromIngredients } from '../../utils/macroCalculator';

/**
 * Full-screen voice meal logging overlay
 * States: listening → processing → confirm → success
 */
export function VoiceLogModal({ onClose, onLog, dark = true }) {
  const { isListening, transcript, startListening, stopListening, error } = useVoiceInput();
  const [state, setState] = useState('idle'); // idle | listening | processing | confirm | success
  const [parsedMeal, setParsedMeal] = useState(null);
  const [waveformBars, setWaveformBars] = useState(Array(16).fill(4));
  const animFrameRef = useRef(null);

  // Start listening immediately on mount
  useEffect(() => {
    setState('listening');
    startListening();
    return () => stopListening();
  }, []);

  // Animate waveform while listening
  useEffect(() => {
    if (state !== 'listening') return;
    const animate = () => {
      setWaveformBars(prev => prev.map(() => 
        isListening ? 4 + Math.random() * 28 : 4
      ));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [state, isListening]);

  // When speech recognition ends, process the transcript
  useEffect(() => {
    if (!isListening && transcript && state === 'listening') {
      handleProcess();
    }
  }, [isListening]);

  const handleProcess = async () => {
    setState('processing');
    // Simulate AI parsing (in production, call speech parser service)
    await new Promise(r => setTimeout(r, 800));

    // Parse transcript into meal
    const words = transcript.toLowerCase();
    const mealSlot = words.includes('breakfast') ? 'Breakfast'
      : words.includes('lunch') ? 'Lunch'
      : words.includes('dinner') ? 'Dinner'
      : words.includes('snack') ? 'Snack'
      : 'Meal';

    // Simple ingredient extraction (would be AI-powered in production)
    const ingredients = transcript.split(/,|and/).map(s => s.trim()).filter(Boolean);
    const macros = computeMealMacrosFromIngredients(ingredients);

    setParsedMeal({
      name: transcript.charAt(0).toUpperCase() + transcript.slice(1),
      type: mealSlot.toLowerCase(),
      slot: mealSlot,
      ingredients,
      calories: macros.calories || Math.round(300 + Math.random() * 400),
      protein: macros.protein || Math.round(20 + Math.random() * 30),
      carbs: macros.carbs || Math.round(30 + Math.random() * 40),
      fat: macros.fat || Math.round(8 + Math.random() * 20),
    });
    setState('confirm');
  };

  const handleLog = () => {
    if (parsedMeal && onLog) {
      onLog(parsedMeal);
    }
    setState('success');
    setTimeout(() => onClose(), 1500);
  };

  const handleRetry = () => {
    setParsedMeal(null);
    setState('listening');
    startListening();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 ${dark ? 'bg-[#080d1a]/95' : 'bg-white/95'} backdrop-blur-xl`}
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-[380px] mx-auto px-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 text-slate-500 hover:text-white text-2xl p-2"
          aria-label="Close voice log"
        >
          ✕
        </button>

        {/* === LISTENING STATE === */}
        {(state === 'idle' || state === 'listening') && (
          <div className="text-center animate-fadeIn">
            {/* Mic icon */}
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 ${isListening ? 'animate-pulse' : ''}`}>
              <span className="text-3xl">🎙️</span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-center gap-2 mb-4">
              {isListening && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              <p className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
                {isListening ? 'Recording...' : 'Tap to start'}
              </p>
            </div>

            {/* Live transcript */}
            {transcript && (
              <p className={`text-lg mb-6 min-h-[60px] ${dark ? 'text-slate-300' : 'text-slate-700'}`}>
                "{transcript}"
              </p>
            )}

            {/* Waveform */}
            <div className="flex items-end justify-center gap-[3px] h-10 mb-8">
              {waveformBars.map((height, i) => (
                <div
                  key={i}
                  className="w-[3px] bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ height: `${height}px`, opacity: 0.4 + (height / 32) * 0.6 }}
                />
              ))}
            </div>

            {/* Done button */}
            {isListening && (
              <Button variant="primary" size="lg" fullWidth onClick={() => { stopListening(); }}>
                ■ DONE
              </Button>
            )}

            {!isListening && !transcript && (
              <Button variant="primary" size="lg" fullWidth onClick={startListening}>
                🎙️ Start Recording
              </Button>
            )}

            {error && (
              <p className="text-red-400 text-sm mt-4">
                {error === 'not-allowed' ? 'Microphone access denied. Please enable it in your browser settings.' : `Error: ${error}`}
              </p>
            )}
          </div>
        )}

        {/* === PROCESSING STATE === */}
        {state === 'processing' && (
          <div className="text-center animate-fadeIn">
            <div className="w-12 h-12 mx-auto mb-4 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className={`font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
              Understanding your meal...
            </p>
          </div>
        )}

        {/* === CONFIRM STATE === */}
        {state === 'confirm' && parsedMeal && (
          <div className="animate-fadeIn">
            <p className="text-center text-2xl mb-4">✨</p>
            <p className={`text-center text-xl font-bold mb-6 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Got it!
            </p>

            {/* Parsed result card */}
            <div className={`rounded-2xl p-5 mb-6 ${dark ? 'bg-slate-800/80 border border-white/[0.06]' : 'bg-white border border-slate-200 shadow-lg'}`}>
              <div className="flex items-center gap-2 mb-3">
                <span>🍽️</span>
                <span className={`text-sm font-bold ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {parsedMeal.slot}
                </span>
              </div>

              <h3 className={`font-bold text-lg mb-3 ${dark ? 'text-white' : 'text-slate-900'}`}>
                {parsedMeal.name}
              </h3>

              {/* Macros */}
              <div className="grid grid-cols-4 gap-2">
                <div className="text-center">
                  <p className="text-lg font-black text-emerald-400">{parsedMeal.calories}</p>
                  <p className="text-[10px] text-slate-500">cal</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-blue-400">{parsedMeal.protein}g</p>
                  <p className="text-[10px] text-slate-500">protein</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-amber-400">{parsedMeal.carbs}g</p>
                  <p className="text-[10px] text-slate-500">carbs</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-purple-400">{parsedMeal.fat}g</p>
                  <p className="text-[10px] text-slate-500">fat</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button variant="secondary" size="lg" className="flex-1" onClick={handleRetry}>
                ✏️ Edit
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={handleLog}>
                Log ✓
              </Button>
            </div>
          </div>
        )}

        {/* === SUCCESS STATE === */}
        {state === 'success' && (
          <div className="text-center animate-fadeIn">
            <div className="text-5xl mb-4 animate-bounce">✅</div>
            <p className={`text-2xl font-bold mb-2 ${dark ? 'text-white' : 'text-slate-900'}`}>
              Logged!
            </p>
            {parsedMeal && (
              <>
                <p className="text-emerald-400 font-bold text-lg">
                  +{parsedMeal.calories} cal
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
