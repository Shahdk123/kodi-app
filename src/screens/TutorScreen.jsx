// TutorScreen.jsx — Main screen of the Kodi app
// Layout:
//   ┌─────────────────────────────┐
//   │  Header: progress + reset   │
//   ├─────────────────────────────┤
//   │  Kodi avatar + speech bubble│
//   ├─────────────────────────────┤
//   │  Code editor + Run button   │  (collapsible)
//   ├─────────────────────────────┤
//   │  Output panel               │
//   ├─────────────────────────────┤
//   │  Mic button + text input    │
//   └─────────────────────────────┘

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, Animated, Dimensions, Alert, Keyboard,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTutor } from '../hooks/useTutor';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { runPythonCode } from '../utils/codeRunner';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Kodi's color palette — ocean/Egyptian theme
const C = {
  bg:        '#0f172a',   // dark navy background
  surface:   '#1e293b',   // card surfaces
  surface2:  '#273548',   // slightly lighter surface
  border:    '#334155',   // subtle borders
  primary:   '#0ea5e9',   // sky blue — Kodi's main color
  accent:    '#f59e0b',   // amber — correct answers / highlights
  success:   '#22c55e',   // green — correct
  danger:    '#ef4444',   // red — errors
  text:      '#f1f5f9',   // primary text
  textMuted: '#94a3b8',   // secondary text
  arabic:    '#e2e8f0',   // Arabic text (slightly warmer)
  codeBg:    '#0d1117',   // GitHub dark code background
  codeText:  '#e6edf3',   // code text
};

// ── Kodi avatar — simple emoji-based character ─────────────────────────────
// Replace with an actual PNG by putting character.png in assets/ and using <Image>
function KodiAvatar({ animation }) {
  const bounce    = useRef(new Animated.Value(0)).current;
  const scale     = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(bounce, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(bounce, { toValue: 0,  duration: 1200, useNativeDriver: true }),
    ])).start();
  }, []);

  useEffect(() => {
    if (animation === 'celebrating') {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.3, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.0, useNativeDriver: true }),
      ]).start();
      Animated.timing(glowOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    } else if (animation === 'talking') {
      Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.97, duration: 300, useNativeDriver: true }),
      ]), { iterations: 4 }).start(() => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      });
    } else if (animation === 'thinking') {
      Animated.loop(Animated.sequence([
        Animated.timing(glowOpacity, { toValue: 0.8, duration: 600, useNativeDriver: true }),
        Animated.timing(glowOpacity, { toValue: 0.3, duration: 600, useNativeDriver: true }),
      ]), { iterations: 3 }).start();
    } else {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      Animated.timing(glowOpacity, { toValue: 0.4, duration: 400, useNativeDriver: true }).start();
    }
  }, [animation]);

  const glowColor = animation === 'celebrating' ? '#fbbf24'
                  : animation === 'talking'     ? '#0ea5e9'
                  : animation === 'thinking'    ? '#a855f7'
                  : animation === 'encouraging' ? '#22c55e'
                  : '#0ea5e9';

                  


  return (
    <View style={styles.avatarWrapper}>
      {/* Glow ring behind avatar */}
      <Animated.View style={[styles.avatarGlow, { backgroundColor: glowColor, opacity: glowOpacity }]} />
      
      {/* Replaced Animated.Text with Animated.Image. 
        Make sure the path matches where your image actually is! 
      */}
      <Animated.Image 
        source={require('../../assets/character.png')}
        style={[
          styles.avatarImage, // Make sure to update your StyleSheet!
          { transform: [{ translateY: bounce }, { scale }] }
        ]} 
      />
    </View> 
  );
}

// ── Speech bubble ──────────────────────────────────────────────────────────
function SpeechBubble({ text, isVisible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (isVisible && text) {
      Animated.parallel([
        Animated.timing(opacity,     { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(translateY,  { toValue: 0, useNativeDriver: true }),
      ]).start();
    }
  }, [text, isVisible]);

  if (!text) return null;
  return (
    <Animated.View style={[styles.bubble, { opacity, transform: [{ translateY }] }]}>
      {(() => {
        // Bilingual text arrives as "Arabic\n(English)": show English as its own left-to-right block
        const cut = text.lastIndexOf('\n(');
        const m = cut > -1 && text.endsWith(')');
        const first = m ? text.slice(0, cut) : text;
        const en = m ? text.slice(cut + 2, -1) : null;
        const firstIsArabic = /[\u0600-\u06FF]/.test(first);
        return (
          <>
            <Text style={[styles.bubbleText, !firstIsArabic && styles.bubbleLtr]}>{first}</Text>
            {en ? <Text style={[styles.bubbleText, styles.bubbleLtr, styles.bubbleEn]}>{en}</Text> : null}
          </>
        );
      })()}
      {/* Bubble tail pointing down toward avatar */}
      <View style={styles.bubbleTail} />
    </Animated.View>
  );
}

// ── Progress bar ───────────────────────────────────────────────────────────
function ProgressBar({ current, total }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const anim = useRef(new Animated.Value(pct)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 400, useNativeDriver: false }).start();
  }, [pct]);

  return (
    <View style={styles.progressOuter}>
      <Animated.View style={[styles.progressInner, {
        width: anim.interpolate({ inputRange: [0,100], outputRange: ['0%','100%'] })
      }]} />
    </View>
  );
}

// ── Code editor ────────────────────────────────────────────────────────────
function CodeEditor({ code, onChange, onRun, output, isRunning }) {
  const [collapsed, setCollapsed] = useState(false);
  const collapseAnim = useRef(new Animated.Value(1)).current;

  const toggleCollapse = () => {
    const toVal = collapsed ? 1 : 0;
    Animated.timing(collapseAnim, { toValue: toVal, duration: 200, useNativeDriver: false }).start();
    setCollapsed(!collapsed);
  };

  const maxHeight = collapseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });

  return (
    <View style={styles.codePanel}>
      {/* Header bar */}
      <TouchableOpacity style={styles.codeHeader} onPress={toggleCollapse} activeOpacity={0.8}>
        <View style={styles.terminalDots}>
          <View style={[styles.termDot, { backgroundColor: '#ef4444' }]} />
          <View style={[styles.termDot, { backgroundColor: '#f59e0b' }]} />
          <View style={[styles.termDot, { backgroundColor: '#22c55e' }]} />
        </View>
        <Text style={styles.codeHeaderTitle}>🐍 Python Editor</Text>
        <TouchableOpacity onPress={onRun} style={styles.runBtn} disabled={isRunning}>
          {isRunning
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={styles.runBtnText}>▶ شغّل</Text>
          }
        </TouchableOpacity>
        <Text style={styles.collapseIcon}>{collapsed ? '▸' : '▾'}</Text>
      </TouchableOpacity>

      {/* Code textarea */}
      <Animated.View style={{ maxHeight, overflow: 'hidden' }}>
        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={onChange}
          multiline
          scrollEnabled
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="ascii-capable"
          textAlignVertical="top"
          placeholder="# اكتب كودك هنا..."
          placeholderTextColor={C.textMuted}
        />

        {/* Output panel */}
        {output !== null && (
          <View style={[styles.outputBox,
            output.isError ? styles.outputError : styles.outputSuccess]}>
            <Text style={styles.outputLabel}>📤 Output</Text>
            <ScrollView style={{ maxHeight: 100 }}>
              <Text style={styles.outputText}>{output.text || '(no output)'}</Text>
            </ScrollView>
          </View>
        )}
      </Animated.View>
    </View>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════

export default function TutorScreen() {
  const [language, setLanguage] = useState('bilingual');
  const [textMsg, setTextMsg]   = useState('');
  const [output, setOutput]     = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const {
    loadState, resetLesson, handleInput,
    bubble, animation, isSpeaking, codeExample, setCodeExample,
    currentStage, stageIdx, totalStages, isComplete,
  } = useTutor(language);

  // ── Handle speech or text input ──────────────────────────────────────────
  const onUserInput = useCallback(async (text) => {
    if (!text.trim() || isSpeaking) return;
    Keyboard.dismiss();
    setTextMsg('');
    await handleInput(text);
  }, [handleInput, isSpeaking]);

  const { isListening, hasVoice, startListening, stopListening } =
    useSpeechRecognition({ onResult: onUserInput, language });

  // ── Load state on mount ──────────────────────────────────────────────────
  useEffect(() => { loadState(); }, []);

  // ── Run Python code ──────────────────────────────────────────────────────
  // Sends code to the local Flask /run_code endpoint.
  // Start the Python backend with: python server.py
  // If backend isn't running, shows a helpful message.
  const runCode = async () => {
    if (!codeExample.trim()) return;
    setIsRunning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await runPythonCode(codeExample);
      setOutput(result);
    } catch (e) {
      setOutput({ text: '⚠️ شغّل server.py الأول عشان تقدر تشغل الكود!\n\nافتح Terminal واكتب:\npython server.py', isError: true });
    }
    setIsRunning(false);
  };

  // ── Reset with confirmation ──────────────────────────────────────────────
  const handleReset = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('إعادة الدرس؟ هتبدأ من الأول.')) resetLesson();
      return;
    }
    Alert.alert('إعادة الدرس؟', 'هتبدأ من الأول. متأكد؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'من الأول ✅', style: 'destructive', onPress: resetLesson },
    ]);
  };

  // ── Completion banner ────────────────────────────────────────────────────
  if (isComplete) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ fontSize: 80 }}>🏆</Text>
        <Text style={[styles.bubbleText, { textAlign: 'center', fontSize: 22, marginTop: 16 }]}>
          مبروك يا بطل! 🎊{'\n'}خلصت الدرس الأول!
        </Text>
        <TouchableOpacity style={[styles.micBtn, { marginTop: 32, paddingHorizontal: 32 }]} onPress={resetLesson}>
          <Text style={styles.micBtnLabel}>🔄 درس جديد</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top','left','right']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Header ──────────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>
                {language === 'en' ? 'Kodi — Python Tutor' : 'كودي — مُدرّس بايثون 🌊'}
              </Text>
              <ProgressBar current={stageIdx} total={totalStages} />
              <Text style={styles.progressLabel}>
                {stageIdx}/{totalStages} {language === 'en' ? 'stages' : 'مرحلة'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {/* Language toggle */}
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setShowLangMenu(v => !v)}
              >
                <Text style={{ color: C.primary, fontSize: 13, fontWeight: '700' }}>
                  {language === 'ar' ? 'ع' : language === 'en' ? 'EN' : 'ع/EN'}
                </Text>
              </TouchableOpacity>
              {/* Reset */}
              <TouchableOpacity style={styles.iconBtn} onPress={handleReset}>
                <Ionicons name="refresh" size={18} color={C.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Language menu */}
          {showLangMenu && (
            <View style={styles.langMenu}>
              {[['bilingual','ع / EN'],['ar','عربي فقط'],['en','English only']].map(([k,label]) => (
                <TouchableOpacity
                  key={k}
                  style={[styles.langOption, language === k && styles.langOptionActive]}
                  onPress={() => { setLanguage(k); setShowLangMenu(false); }}
                >
                  <Text style={[styles.langOptionText, language===k && {color: C.primary}]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* ── Stage type badge ─────────────────────────────────────────── */}
          {currentStage && (
            <View style={styles.stageBadge}>
              <Text style={styles.stageBadgeText}>
                {currentStage.type === 'teach'     ? '📚 شرح'
               : currentStage.type === 'question'  ? '❓ سؤال'
               : currentStage.type === 'challenge' ? '💪 تحدي'
               : ''}
                {' — '}{stageIdx + 1}/{totalStages}
              </Text>
            </View>
          )}

          {/* ── Avatar + bubble ──────────────────────────────────────────── */}
          <View style={styles.characterArea}>
            <SpeechBubble text={bubble} isVisible={!!bubble} />
            <KodiAvatar animation={animation} />
            {isSpeaking && (
              <View style={styles.speakingDots}>
                {[0,1,2].map(i => <SpeakingDot key={i} delay={i * 200} />)}
              </View>
            )}
          </View>

          {/* ── Code editor ─────────────────────────────────────────────── */}
          <CodeEditor
            code={codeExample}
            onChange={setCodeExample}
            onRun={runCode}
            output={output}
            isRunning={isRunning}
          />

        </ScrollView>

        {/* ── Input row (fixed at bottom) ────────────────────────────────── */}
        <View style={styles.inputRow}>
          {/* Text input */}
          <TextInput
            style={styles.textInput}
            value={textMsg}
            onChangeText={setTextMsg}
            placeholder={language === 'en' ? 'Type your answer...' : 'اكتب هنا...'}
            placeholderTextColor={C.textMuted}
            returnKeyType="send"
            onSubmitEditing={() => onUserInput(textMsg)}
            editable={!isSpeaking}
            dir="auto"
          />

          {/* Send button */}
          <TouchableOpacity
            style={[styles.sendBtn, (!textMsg.trim() || isSpeaking) && styles.btnDisabled]}
            onPress={() => onUserInput(textMsg)}
            disabled={!textMsg.trim() || isSpeaking}
          >
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Mic button */}
          {hasVoice && (
            <TouchableOpacity
              style={[styles.micBtn, isListening && styles.micBtnActive, isSpeaking && styles.btnDisabled]}
              onPress={isListening ? stopListening : startListening}
              disabled={isSpeaking}
            >
              <Ionicons
                name={isListening ? 'stop-circle' : 'mic'}
                size={22}
                color="#fff"
              />
              <Text style={styles.micBtnLabel}>
                {isListening
                  ? (language === 'en' ? 'Stop' : 'وقّف')
                  : (language === 'en' ? 'Speak' : 'تكلم')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Animated speaking indicator dots
function SpeakingDot({ delay }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <Animated.View style={[styles.dot, {
      opacity: anim, transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[0.6,1.2] }) }]
    }]} />
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: C.bg },
  scroll:       { paddingBottom: 16 },

  // Header
  header:       { flexDirection: 'row', alignItems: 'center', padding: 14, paddingBottom: 8 },
  headerTitle:  { color: C.primary, fontSize: 15, fontWeight: '700', marginBottom: 6 },
  progressLabel:{ color: C.textMuted, fontSize: 11, marginTop: 3 },
  headerActions:{ flexDirection: 'row', gap: 8, marginLeft: 10 },
  iconBtn:      { width: 36, height: 36, borderRadius: 18, backgroundColor: C.surface2,
                  justifyContent: 'center', alignItems: 'center' },

  // Progress bar
  progressOuter:{ height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden' },
  progressInner:{ height: '100%', backgroundColor: C.primary, borderRadius: 3 },

  // Language menu
  langMenu:     { backgroundColor: C.surface, marginHorizontal: 14, borderRadius: 10,
                  borderWidth: 1, borderColor: C.border, overflow: 'hidden', marginBottom: 8 },
  langOption:   { padding: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  langOptionActive: { backgroundColor: C.surface2 },
  langOptionText: { color: C.text, textAlign: 'center', fontSize: 14 },

  // Stage badge
  stageBadge:   { alignSelf: 'center', backgroundColor: C.surface2, borderRadius: 20,
                  paddingHorizontal: 14, paddingVertical: 5, marginBottom: 8 },
  stageBadgeText: { color: C.primary, fontSize: 12, fontWeight: '600' },

  // Character area
  characterArea:{ alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  avatarWrapper:{ alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  avatarGlow:   { position: 'absolute', width: 110, height: 110, borderRadius: 55 },
  avatarImage:  { width: 120, height: 120, resizeMode: 'contain' },
  avatarEmoji:  { fontSize: 72, lineHeight: 88 },
  speakingDots: { flexDirection: 'row', gap: 6, marginTop: 6 },
  dot:          { width: 8, height: 8, borderRadius: 4, backgroundColor: C.primary },

  // Speech bubble
  bubble:       { backgroundColor: C.surface, borderRadius: 16, padding: 14,
                  marginBottom: 8, marginHorizontal: 4,
                  borderWidth: 1, borderColor: C.border,
                  shadowColor: C.primary, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  bubbleText:   { color: C.arabic, fontSize: 15, lineHeight: 24, textAlign: 'right' },
  bubbleLtr:    { textAlign: 'left', writingDirection: 'ltr' },
  bubbleEn:     { color: C.textMuted, fontSize: 14, marginTop: 12, paddingTop: 12,
                  borderTopWidth: 1, borderTopColor: C.border },
  bubbleTail:   { position: 'absolute', bottom: -10, left: '50%', marginLeft: -10,
                  width: 0, height: 0,
                  borderLeftWidth: 10, borderRightWidth: 10, borderTopWidth: 10,
                  borderLeftColor: 'transparent', borderRightColor: 'transparent',
                  borderTopColor: C.surface },

  // Code editor
  codePanel:    { marginHorizontal: 12, borderRadius: 12, overflow: 'hidden',
                  backgroundColor: C.codeBg, borderWidth: 1, borderColor: C.border,
                  marginBottom: 12 },
  codeHeader:   { flexDirection: 'row', alignItems: 'center', padding: 10,
                  backgroundColor: C.surface2, gap: 8 },
  terminalDots: { flexDirection: 'row', gap: 5 },
  termDot:      { width: 10, height: 10, borderRadius: 5 },
  codeHeaderTitle: { flex: 1, color: C.textMuted, fontSize: 12, fontWeight: '600' },
  runBtn:       { backgroundColor: C.success, borderRadius: 8, paddingHorizontal: 12,
                  paddingVertical: 5, minWidth: 60, alignItems: 'center' },
  runBtnText:   { color: '#fff', fontSize: 13, fontWeight: '700' },
  collapseIcon: { color: C.textMuted, fontSize: 16, paddingLeft: 4 },
  codeInput:    { color: C.codeText, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  fontSize: 13, lineHeight: 20, padding: 12, minHeight: 140,
                  backgroundColor: C.codeBg, textAlignVertical: 'top' },

  // Output
  outputBox:    { borderTopWidth: 1, borderTopColor: C.border, padding: 10 },
  outputError:  { backgroundColor: '#1a0a0a' },
  outputSuccess:{ backgroundColor: '#0a1a0a' },
  outputLabel:  { color: C.textMuted, fontSize: 11, marginBottom: 4 },
  outputText:   { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                  fontSize: 12, lineHeight: 18, color: C.codeText },

  // Input row
  inputRow:     { flexDirection: 'row', padding: 10, gap: 8,
                  backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  textInput:    { flex: 1, minWidth: 0, backgroundColor: C.surface2, color: C.text, borderRadius: 22,
                  paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
                  fontSize: 14, borderWidth: 1, borderColor: C.border },
  sendBtn:      { width: 44, height: 44, borderRadius: 22, backgroundColor: C.primary,
                  justifyContent: 'center', alignItems: 'center' },
  micBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5,
                  backgroundColor: C.primary, borderRadius: 22,
                  paddingHorizontal: 14, height: 44 },
  micBtnActive: { backgroundColor: C.danger },
  micBtnLabel:  { color: '#fff', fontSize: 13, fontWeight: '600' },
  btnDisabled:  { opacity: 0.4 },
});
