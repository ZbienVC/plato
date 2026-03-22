import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVoiceInput } from '../../hooks/useVoiceInput';
import { Button, PrimaryButton, SecondaryButton } from '../atoms/Button';
import { computeMealMacrosFromIngredients } from '../../utils/macroCalculator';
import { Mic, MicOff, RotateCcw, Check, X, Edit3 } from 'lucide-react';

/**
 * Enhanced full-screen voice meal logging overlay
 * States: listening → processing → confirm → success
 * Improvements: Better feedback, error handling, confirmation flow
 */
export function VoiceLogModalEnhanced({ onClose, onLog, dark = true }) {
  const { isListening, transcript, startListening, stopListening, error } = useVoiceInput();
  const [state, setState] = useState('idle'); // idle | listening | processing | confirm | success | error
  const [parsedMeal, setParsedMeal] = useState(null);
  const [editableTranscript, setEditableTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [waveformBars, setWaveformBars] = useState(Array(20).fill(4));
  const animFrameRef = useRef(null);
  const timeoutRef = useRef(null);

  // Start listening immediately on mount
  useEffect(() => {
    setState('listening');
    startListening();
    
    // Auto-stop after 10 seconds for better UX
    timeoutRef.current = setTimeout(() => {
      if (state === 'listening') {
        handleStopListening();
      }
    }, 10000);

    return () => {
      stopListening();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Enhanced waveform animation
  useEffect(() => {
    if (state !== 'listening') return;
    let animationId;
    
    const animate = () => {
      setWaveformBars(prev => prev.map((_, i) => {
        if (!isListening) return 4;
        
        // Create wave pattern with slight randomization
        const baseHeight = 4;
        const maxHeight = 32;
        const wave = Math.sin((Date.now() / 200) + (i / 3)) * 0.5 + 0.5;
        const randomFactor = 0.7 + (Math.random() * 0.3);
        
        return baseHeight + (wave * maxHeight * randomFactor);
      }));
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [state, isListening]);

  // Handle transcript completion with better error handling
  useEffect(() => {
    if (!isListening && transcript && state === 'listening') {
      setEditableTranscript(transcript);
      if (transcript.length > 5) {
        handleProcess(transcript);
      } else {
        // Too short - show error state
        setState('error');
        setConfidence(0);
      }
    }
  }, [isListening, transcript, state]);

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      setState('error');
      setConfidence(0);
    }
  }, [error]);

  const handleStopListening = () => {
    stopListening();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleProcess = async (textInput = editableTranscript) => {
    setState('processing');
    
    try {
      // Simulate AI parsing with better logic (in production, call speech parser service)
      await new Promise(r => setTimeout(r, 1000));

      // Parse transcript into meal with improved logic
      const words = textInput.toLowerCase();
      
      // Better meal slot detection
      const mealSlot = detectMealSlot(words) || inferMealSlotFromTime();
      
      // Enhanced ingredient extraction
      const ingredients = extractIngredients(textInput);
      const macros = computeMealMacrosFromIngredients(ingredients);
      
      // Calculate confidence score based on parsing quality
      const calculatedConfidence = calculateConfidence(textInput, ingredients, macros);
      setConfidence(calculatedConfidence);

      const meal = {
        name: textInput.charAt(0).toUpperCase() + textInput.slice(1),
        type: mealSlot.toLowerCase(),
        slot: mealSlot,
        ingredients,
        calories: macros.calories || estimateCalories(ingredients),
        protein: macros.protein || estimateProtein(ingredients),
        carbs: macros.carbs || estimateCarbs(ingredients),
        fat: macros.fat || estimateFat(ingredients),
        confidence: calculatedConfidence
      };

      setParsedMeal(meal);
      setState('confirm');
      
    } catch (err) {
      setState('error');
      setConfidence(0);
    }
  };

  // Helper functions for better parsing
  const detectMealSlot = (words) => {
    if (words.includes('breakfast') || words.includes('morning')) return 'Breakfast';
    if (words.includes('lunch') || words.includes('noon')) return 'Lunch';
    if (words.includes('dinner') || words.includes('evening')) return 'Dinner';
    if (words.includes('snack')) return 'Snack';
    return null;
  };

  const inferMealSlotFromTime = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    if (hour < 21) return 'Dinner';
    return 'Snack';
  };

  const extractIngredients = (text) => {
    // Enhanced ingredient extraction with better parsing
    const commonSeparators = /,|and|with|plus|\+/gi;
    const ingredients = text
      .split(commonSeparators)
      .map(s => s.trim())
      .filter(s => s.length > 2)
      .slice(0, 8); // Limit to 8 ingredients max
    
    return ingredients.length > 0 ? ingredients : ['Mixed meal'];
  };

  const calculateConfidence = (text, ingredients, macros) => {
    let score = 0.3; // Base score
    
    // Text quality
    if (text.length > 10) score += 0.2;
    if (text.length > 20) score += 0.1;
    
    // Ingredient detection
    if (ingredients.length > 1) score += 0.2;
    if (ingredients.length > 3) score += 0.1;
    
    // Macro calculation success
    if (macros.calories > 0) score += 0.2;
    
    return Math.min(score, 0.95); // Cap at 95%
  };

  // Improved estimates
  const estimateCalories = (ingredients) => {
    const baseCalories = Math.max(200, Math.min(800, ingredients.length * 120));
    return Math.round(baseCalories + (Math.random() * 100));
  };

  const estimateProtein = (ingredients) => {
    return Math.round(15 + (ingredients.length * 8) + (Math.random() * 15));
  };

  const estimateCarbs = (ingredients) => {
    return Math.round(25 + (ingredients.length * 10) + (Math.random() * 20));
  };

  const estimateFat = (ingredients) => {
    return Math.round(8 + (ingredients.length * 4) + (Math.random() * 12));
  };

  const handleLog = () => {
    if (parsedMeal && onLog) {
      onLog(parsedMeal);
    }
    setState('success');
    setTimeout(() => onClose(), 1800);
  };

  const handleRetry = () => {
    setParsedMeal(null);
    setEditableTranscript('');
    setConfidence(0);
    setState('listening');
    startListening();
    
    // Reset timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (state === 'listening') {
        handleStopListening();
      }
    }, 10000);
  };

  const handleEditTranscript = () => {
    setState('editing');
  };

  const handleSaveEdit = () => {
    if (editableTranscript.trim().length > 3) {
      handleProcess(editableTranscript);
    }
  };

  const getStateContent = () => {
    switch (state) {
      case 'listening':
        return {
          title: "I'm listening...",
          subtitle: isListening ? "Speak clearly about your meal" : "Processing your voice...",
          color: "#14B8A6"
        };
      
      case 'processing':
        return {
          title: "Analyzing meal...",
          subtitle: "Understanding ingredients and macros",
          color: "#6366F1"
        };
      
      case 'confirm':
        return {
          title: "Does this look right?",
          subtitle: `Confidence: ${Math.round(confidence * 100)}%`,
          color: confidence > 0.7 ? "#22C55E" : "#F59E0B"
        };
      
      case 'success':
        return {
          title: "Meal logged successfully!",
          subtitle: "Added to your daily nutrition",
          color: "#22C55E"
        };
      
      case 'error':
        return {
          title: "Couldn't understand",
          subtitle: "Please try speaking more clearly",
          color: "#EF4444"
        };

      case 'editing':
        return {
          title: "Edit your input",
          subtitle: "Make corrections and try again",
          color: "#8B5CF6"
        };
      
      default:
        return {
          title: "Voice Log",
          subtitle: "Speak to log your meal",
          color: "#14B8A6"
        };
    }
  };

  const stateContent = getStateContent();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Enhanced Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`absolute inset-0 ${dark ? 'bg-[#080d1a]/96' : 'bg-white/96'} backdrop-blur-2xl`}
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-full max-w-[400px] mx-auto px-6"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>

          {/* Main Content Card */}
          <motion.div
            layout
            className="glass rounded-3xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))`,
              border: `1px solid ${stateContent.color}40`
            }}
          >
            {/* State Title */}
            <motion.h2
              key={stateContent.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white mb-2"
            >
              {stateContent.title}
            </motion.h2>

            <motion.p
              key={stateContent.subtitle}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-slate-400 mb-8"
            >
              {stateContent.subtitle}
            </motion.p>

            {/* Visual State Indicator */}
            <div className="mb-8">
              <AnimatePresence mode="wait">
                {state === 'listening' && (
                  <motion.div
                    key="waveform"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex items-center justify-center gap-1 h-16"
                  >
                    {waveformBars.map((height, i) => (
                      <motion.div
                        key={i}
                        style={{
                          height: `${height}px`,
                          backgroundColor: stateContent.color,
                        }}
                        className="w-1 rounded-full opacity-80"
                        animate={{ height: `${height}px` }}
                        transition={{ duration: 0.1 }}
                      />
                    ))}
                  </motion.div>
                )}

                {state === 'processing' && (
                  <motion.div
                    key="processing"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: `${stateContent.color}20` }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-current border-t-transparent rounded-full"
                      style={{ borderColor: stateContent.color }}
                    />
                  </motion.div>
                )}

                {(state === 'success' || state === 'confirm') && (
                  <motion.div
                    key="check"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: `${stateContent.color}20` }}
                  >
                    <Check size={32} style={{ color: stateContent.color }} />
                  </motion.div>
                )}

                {state === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                    style={{ background: `${stateContent.color}20` }}
                  >
                    <MicOff size={32} style={{ color: stateContent.color }} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Transcript Display */}
            {(transcript || editableTranscript) && state !== 'success' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                {state === 'editing' ? (
                  <textarea
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full bg-transparent text-white text-sm resize-none border-none outline-none placeholder-slate-500"
                    placeholder="Describe what you ate..."
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <p className="text-white text-sm">{editableTranscript || transcript}</p>
                )}
              </motion.div>
            )}

            {/* Parsed Meal Confirmation */}
            {parsedMeal && state === 'confirm' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-xl text-left"
                style={{ background: 'rgba(255,255,255,0.04)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-white font-semibold text-sm">{parsedMeal.name}</h4>
                    <p className="text-slate-400 text-xs">{parsedMeal.slot}</p>
                  </div>
                  <button
                    onClick={handleEditTranscript}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-white font-semibold">{parsedMeal.calories}</div>
                    <div className="text-slate-500">Cal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{parsedMeal.protein}g</div>
                    <div className="text-slate-500">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{parsedMeal.carbs}g</div>
                    <div className="text-slate-500">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-semibold">{parsedMeal.fat}g</div>
                    <div className="text-slate-500">Fat</div>
                  </div>
                </div>

                {parsedMeal.ingredients && parsedMeal.ingredients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-slate-400 text-xs mb-1">Ingredients:</p>
                    <p className="text-white text-xs">{parsedMeal.ingredients.join(', ')}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <AnimatePresence mode="wait">
                {state === 'listening' && (
                  <motion.div
                    key="listening-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 w-full"
                  >
                    <SecondaryButton
                      onClick={handleStopListening}
                      className="flex-1"
                      icon={<MicOff size={16} />}
                    >
                      Stop
                    </SecondaryButton>
                  </motion.div>
                )}

                {state === 'confirm' && (
                  <motion.div
                    key="confirm-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 w-full"
                  >
                    <SecondaryButton
                      onClick={handleRetry}
                      className="flex-1"
                      icon={<RotateCcw size={16} />}
                    >
                      Retry
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleLog}
                      className="flex-1"
                      icon={<Check size={16} />}
                    >
                      Log Meal
                    </PrimaryButton>
                  </motion.div>
                )}

                {state === 'editing' && (
                  <motion.div
                    key="editing-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 w-full"
                  >
                    <SecondaryButton
                      onClick={() => setState('confirm')}
                      className="flex-1"
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleSaveEdit}
                      className="flex-1"
                      icon={<Check size={16} />}
                    >
                      Analyze
                    </PrimaryButton>
                  </motion.div>
                )}

                {(state === 'error' || state === 'processing') && (
                  <motion.div
                    key="error-actions"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex gap-3 w-full"
                  >
                    <SecondaryButton
                      onClick={onClose}
                      className="flex-1"
                    >
                      Cancel
                    </SecondaryButton>
                    <PrimaryButton
                      onClick={handleRetry}
                      className="flex-1"
                      icon={<RotateCcw size={16} />}
                    >
                      Try Again
                    </PrimaryButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}