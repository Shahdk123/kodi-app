// useSpeechRecognition.web.js — browser Web Speech API (Chrome/Edge/Safari). Same API as the native hook.
import { useState, useRef, useCallback } from 'react';

export function useSpeechRecognition({ onResult, language = 'bilingual' }) {
  const [isListening, setIsListening] = useState(false);
  const recRef = useRef(null);
  const SR = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const voiceLang = language === 'en' ? 'en-US' : 'ar-EG';

  const startListening = useCallback(() => {
    if (!SR) return;
    const rec = new SR();
    rec.lang = voiceLang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      setIsListening(false);
      if (text) onResult(text);
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    recRef.current = rec;
    setIsListening(true);
    try { rec.start(); } catch { setIsListening(false); }
  }, [SR, voiceLang, onResult]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    try { recRef.current?.stop(); } catch {}
  }, []);

  return { isListening, hasVoice: !!SR, startListening, stopListening, SpeechWebView: () => null };
}
