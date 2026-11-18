import { useState, useRef, useCallback } from 'react';
import { WebView } from 'react-native-webview';
import React from 'react';

export function useSpeechRecognition({ onResult, language = 'bilingual' }) {
  const [isListening, setIsListening] = useState(false);
  const webViewRef = useRef(null);

  const voiceLang = language === 'en' ? 'en-US' : 'ar-SA';

  const startListening = useCallback(() => {
    setIsListening(true);
    webViewRef.current?.injectJavaScript(`startRecognition('${voiceLang}'); true;`);
  }, [voiceLang]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    webViewRef.current?.injectJavaScript(`stopRecognition(); true;`);
  }, []);

  const onMessage = useCallback((event) => {
    const { type, text } = JSON.parse(event.nativeEvent.data);
    if (type === 'result' && text) {
      setIsListening(false);
      onResult(text);
    } else if (type === 'end') {
      setIsListening(false);
    }
  }, [onResult]);

  const SpeechWebView = useCallback(() => React.createElement(WebView, {
    ref: webViewRef,
    style: { width: 0, height: 0, position: 'absolute' },
    originWhitelist: ['*'],
    onMessage,
    source: { html: `
      <html><body><script>
        let recognition = null;
        function startRecognition(lang) {
          recognition = new webkitSpeechRecognition();
          recognition.lang = lang;
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'result', text }));
          };
          recognition.onend = () => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'end' }));
          };
          recognition.start();
        }
        function stopRecognition() {
          if (recognition) recognition.stop();
        }
      </script></body></html>
    `},
  }), [onMessage]);

  return { isListening, hasVoice: true, startListening, stopListening, SpeechWebView };
}
