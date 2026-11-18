// useTutor.js — React hook that wires lesson engine + TTS + state together
// All lesson logic is on-device. The hook exposes a clean API to the screen.

import { useState, useCallback, useRef } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getInitialState, getCurrentStage, processMessage, getOpeningMessage, STAGES
} from '../utils/lessonEngine';

const STATE_KEY = 'kodi_lesson_state';

export function useTutor(language = 'bilingual') {
  const [state, setState]         = useState(null);       // lesson state
  const [bubble, setBubble]       = useState('');         // Kodi's speech bubble text
  const [animation, setAnimation] = useState('idle');     // avatar animation
  const [isSpeaking, setIsSpeaking] = useState(false);   // Kodi is talking
  const [codeExample, setCodeExample] = useState('');     // code panel content
  const speakingRef = useRef(false);

  // ── Load or create state from AsyncStorage ─────────────────────────────────
  const loadState = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STATE_KEY);
      const s = saved ? JSON.parse(saved) : getInitialState();
      setState(s);
      const opening = getOpeningMessage(s);
      setBubble(language === 'ar' ? opening.responseAr
              : language === 'en' ? opening.responseEn
              : opening.responseAr + '\n(' + opening.responseEn + ')');
      if (opening.codeExample) setCodeExample(opening.codeExample);
      speakOpening(opening, language);
    } catch {
      const s = getInitialState();
      setState(s);
    }
  }, [language]);

  // ── Save state to AsyncStorage (persists across app restarts) ──────────────
  const saveState = useCallback(async (s) => {
    try { await AsyncStorage.setItem(STATE_KEY, JSON.stringify(s)); } catch {}
  }, []);

  // ── Reset lesson ───────────────────────────────────────────────────────────
  const resetLesson = useCallback(async () => {
    Speech.stop();
    const s = getInitialState();
    setState(s);
    await AsyncStorage.removeItem(STATE_KEY);
    const opening = getOpeningMessage(s);
    setBubble(language === 'ar' ? opening.responseAr
            : language === 'en' ? opening.responseEn
            : opening.responseAr + '\n(' + opening.responseEn + ')');
    if (opening.codeExample) setCodeExample(opening.codeExample);
    setAnimation('idle');
    speakOpening(opening, language);
  }, [language]);

  // ── Speak via expo-speech (native Siri/TTS voices — very fast) ─────────────
  const speakText = useCallback((ar, en, lang) => {
    Speech.stop();
    speakingRef.current = true;
    setIsSpeaking(true);
    setAnimation('talking');

    // Pick text based on language mode
    const primary   = lang === 'en' ? (en || ar) : ar;
    const secondary = lang === 'bilingual' ? en : null;

    const onDone = () => {
      speakingRef.current = false;
      setIsSpeaking(false);
      setAnimation('idle');
    };

    if (lang === 'bilingual' && primary && secondary) {
      // Speak Arabic first, then English
      Speech.speak(primary, {
        language: 'ar',
        rate: 0.85,
        onDone: () => {
          Speech.speak(secondary, {
            language: 'en',
            rate: 0.9,
            onDone,
            onError: onDone,
          });
        },
        onError: () => {
          Speech.speak(secondary, { language: 'en', rate: 0.9, onDone, onError: onDone });
        },
      });
    } else {
      Speech.speak(primary || en || '', {
        language: lang === 'en' ? 'en' : 'ar',
        rate: 0.85,
        onDone,
        onError: onDone,
      });
    }
  }, []);

  function speakOpening(opening, lang) {
    speakText(opening.responseAr, opening.responseEn, lang);
  }

  // ── Process child's input ──────────────────────────────────────────────────
  const handleInput = useCallback(async (inputText) => {
    if (!state || isSpeaking) return;
    Speech.stop();

    const result = processMessage(state, inputText);

    // Next stage (if any) — its lesson text must be shown after the praise
    const nextStage = result.newState.stageIdx < STAGES.length
      ? STAGES[result.newState.stageIdx] : null;
    let ar = result.responseAr;
    let en = result.responseEn;
    if (result.isCorrect && nextStage && !result.newState.complete) {
      ar = ar + '\n\n' + nextStage.contentAr;
      en = en + '\n\n' + nextStage.contentEn;
    }

    // Update bubble
    const bubbleText = language === 'ar' ? ar
                     : language === 'en' ? en
                     : ar + '\n(' + en + ')';
    setBubble(bubbleText);

    // Update avatar
    setAnimation(result.animation);

    // Haptic feedback
    if (result.isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Update code if moved to next stage
    if (nextStage?.codeExample) {
      setCodeExample(nextStage.codeExample);
    }

    // Save new state
    setState(result.newState);
    await saveState(result.newState);

    // Speak response
    speakText(ar, en, language);
  }, [state, isSpeaking, language, speakText, saveState]);

  // ── Current stage metadata ─────────────────────────────────────────────────
  const currentStage = state ? getCurrentStage(state) : null;
  const stageIdx     = state?.stageIdx ?? 0;
  const totalStages  = STAGES.length;
  const isComplete   = state?.complete ?? false;

  return {
    loadState, resetLesson, handleInput,
    bubble, animation, isSpeaking, codeExample, setCodeExample,
    currentStage, stageIdx, totalStages, isComplete,
  };
}
