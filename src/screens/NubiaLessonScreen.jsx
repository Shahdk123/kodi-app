// NubiaLessonScreen.jsx — puzzle-style, Arabic-only lesson on a Nubian village-on-the-Nile background.
// Birds, felucca boats and a camel drift across the screen, golden dust rises, Kodi talks in short sentences.

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated, Easing,
  ImageBackground, Image, Platform, Alert, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STAGES, PRAISE, LESSON_META } from '../data/nubiaLesson01';
import { simulate } from '../utils/printSim';

const KEY = 'kodi_nubia_lesson01_v1';
const C = {
  card: 'rgba(40, 17, 8, 0.80)', border: 'rgba(255,255,255,0.18)',
  text: '#f8fafc', muted: '#cbd5e1', primary: '#c2410c', good: '#22c55e', bad: '#ef4444', gold: '#fbbf24',
};
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const pick = (a) => a[Math.floor(Math.random() * a.length)];
function shuffle(arr, avoid) {
  let a;
  do { a = [...arr].sort(() => Math.random() - 0.5); }
  while (avoid && a.length > 1 && a.every((x, i) => x.t === avoid[i]));
  return a;
}

// ── Drifting birds, boats, camel + rising golden dust (background layer) ──
const FISH = [
  { e: '🦅', top: 0.14, size: 34, dur: 17000, delay: 0,    dir: 1 },
  { e: '🕊️', top: 0.28, size: 28, dur: 22000, delay: 2500, dir: -1 },
  { e: '🦅', top: 0.43, size: 30, dur: 26000, delay: 5000, dir: -1 },
  { e: '⛵', top: 0.61, size: 34, dur: 30000, delay: 1200, dir: 1 },
  { e: '🐊', top: 0.72, size: 30, dur: 36000, delay: 8000, dir: -1 },
  { e: '🐪', top: 0.82, size: 40, dur: 42000, delay: 3000, dir: 1 },
];

function Fish({ cfg, W, H }) {
  const x = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(cfg.delay),
      Animated.timing(x, { toValue: 1, duration: cfg.dur, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(x, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
    Animated.loop(Animated.sequence([
      Animated.timing(y, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  const tx = x.interpolate({ inputRange: [0, 1], outputRange: cfg.dir === 1 ? [-70, W + 70] : [W + 70, -70] });
  const ty = y.interpolate({ inputRange: [0, 1], outputRange: [-12, 12] });
  return (
    <Animated.Text style={{
      position: 'absolute', top: cfg.top * H, left: 0, fontSize: cfg.size, opacity: 0.92,
      transform: [{ translateX: tx }, { translateY: ty }, { scaleX: cfg.dir === 1 ? -1 : 1 }],
    }}>{cfg.e}</Animated.Text>
  );
}

function Bubble({ left, size, dur, delay, H }) {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.delay(delay),
      Animated.timing(p, { toValue: 1, duration: dur, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(p, { toValue: 0, duration: 0, useNativeDriver: true }),
    ])).start();
  }, []);
  const ty = p.interpolate({ inputRange: [0, 1], outputRange: [H + 20, -40] });
  const op = p.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.7, 0.7, 0] });
  return (
    <Animated.View style={{
      position: 'absolute', top: 0, left, width: size, height: size, borderRadius: size / 2,
      borderWidth: 1.5, borderColor: 'rgba(253,224,71,0.9)', backgroundColor: 'rgba(251,191,36,0.28)',
      opacity: op, transform: [{ translateY: ty }],
    }} />
  );
}

function Desert({ W, H }) {
  const bubbles = useMemo(() => Array.from({ length: 9 }, (_, i) => ({
    left: (i * 0.113 + 0.04) * W, size: 8 + (i % 4) * 5, dur: 7000 + (i % 5) * 1800, delay: i * 700,
  })), [W]);
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {bubbles.map((b, i) => <Bubble key={'b' + i} {...b} H={H} />)}
      {FISH.map((f, i) => <Fish key={'f' + i} cfg={f} W={W} H={H} />)}
    </View>
  );
}

// ── Code tiles ─────────────────────────────────────────────────────────────
function tileColor(t) {
  if (/^print\(/.test(t)) return '#2dd4bf';
  if (t === 'print') return '#2dd4bf';
  if (t === '(' || t === ')') return C.gold;
  if (/^["']/.test(t)) return '#34d399';
  return '#cbd5e1';
}

function Tile({ t, onPress, status, wide }) {
  const col = status === 'bad' ? C.bad : status === 'ok' ? C.good : tileColor(t);
  return (
    <TouchableOpacity
      activeOpacity={0.7} onPress={onPress} disabled={!onPress}
      style={[S.tile, { borderColor: col, backgroundColor: status === 'ok' ? 'rgba(34,197,94,0.25)' : 'rgba(28,12,6,0.92)' },
              wide && { alignSelf: 'stretch' }]}
    >
      <Text style={[S.tileText, { color: col }]}>{t}</Text>
    </TouchableOpacity>
  );
}

// ── Order puzzle ───────────────────────────────────────────────────────────
function OrderPuzzle({ stage, onSolved, onMistake }) {
  const lines = stage.layout === 'lines';
  const joiner = lines ? '\n' : '';
  const all = useMemo(() => shuffle(
    [...stage.solution, ...(stage.decoys || [])].map((t, i) => ({ id: i, t })), stage.solution), [stage.id]);
  const N = stage.solution.length;
  const [placed, setPlaced] = useState([]);
  const [status, setStatus] = useState(null);
  const byId = (id) => all.find(x => x.id === id);

  const check = (ids) => {
    const code = ids.map(id => byId(id).t).join(joiner);
    const ok = stage.accept ? new RegExp(stage.accept).test(code)
                            : ids.map(id => byId(id).t).every((t, i) => t === stage.solution[i]);
    if (ok) { setStatus('ok'); setTimeout(() => onSolved(code), 450); }
    else {
      setStatus('bad'); onMistake(stage.hint || 'جرّب تاني! 🐪');
      setTimeout(() => { setPlaced([]); setStatus(null); }, 1100);
    }
  };
  const add = (id) => {
    if (status || placed.includes(id) || placed.length >= N) return;
    const next = [...placed, id]; setPlaced(next);
    if (next.length === N) check(next);
  };
  const remove = (i) => { if (status) return; setPlaced(placed.filter((_, k) => k !== i)); };

  return (
    <View style={{ direction: 'ltr' }}>
      <View style={[S.slotsBox, lines && { flexDirection: 'column' }]}>
        {Array.from({ length: N }).map((_, i) => (
          <View key={i} style={[S.slot, lines && { alignSelf: 'stretch' }]}>
            {placed[i] !== undefined
              ? <Tile t={byId(placed[i]).t} status={status} onPress={() => remove(i)} wide={lines} />
              : <Text style={S.slotNum}>{i + 1}</Text>}
          </View>
        ))}
      </View>
      <View style={[S.pool, lines && { flexDirection: 'column' }]}>
        {all.map(x => placed.includes(x.id)
          ? <View key={x.id} style={[S.tile, S.ghost, lines && { alignSelf: 'stretch' }]}><Text style={[S.tileText, { opacity: 0 }]}>{x.t}</Text></View>
          : <Tile key={x.id} t={x.t} onPress={() => add(x.id)} wide={lines} />)}
      </View>
    </View>
  );
}

// ── Choice puzzle ──────────────────────────────────────────────────────────
function ChoicePuzzle({ stage, onSolved, onMistake }) {
  const opts = useMemo(() => [...stage.options].sort(() => Math.random() - 0.5), [stage.id]);
  const [wrong, setWrong] = useState([]);
  const [okIdx, setOkIdx] = useState(null);
  return (
    <View style={{ direction: 'ltr', gap: 12 }}>
      {opts.map((o, i) => (
        <Tile key={i} wide t={o.code}
          status={okIdx === i ? 'ok' : wrong.includes(i) ? 'bad' : null}
          onPress={okIdx !== null || wrong.includes(i) ? undefined : () => {
            if (o.ok) { setOkIdx(i); setTimeout(() => onSolved(o.code), 450); }
            else { setWrong([...wrong, i]); onMistake(o.why); }
          }} />
      ))}
    </View>
  );
}

// ── Static visuals ─────────────────────────────────────────────────────────
function PartsVisual() {
  const parts = [
    { t: 'print', l: 'الأمر 🖌️' }, { t: '(', l: 'الباب يفتح 🚪' },
    { t: '"كلام"', l: 'البيت 🏠' }, { t: ')', l: 'الباب يقفل 🚪' },
  ];
  return (
    <View style={{ direction: 'ltr', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
      {parts.map((p, i) => (
        <View key={i} style={{ alignItems: 'center', gap: 6 }}>
          <Tile t={p.t} />
          <Text style={S.partLabel}>{p.l}</Text>
        </View>
      ))}
    </View>
  );
}
function HouseVisual() {
  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <View style={S.house}>
        <Text style={S.houseBand}>◥◤◥◤◥◤◥◤◥◤</Text>
        <Text style={[S.tileText, { color: '#34d399', fontSize: 24 }]}>" أهلاً 🏠 "</Text>
      </View>
      <Text style={S.partLabel}>علامتين التنصيص = حيطان البيت</Text>
    </View>
  );
}

// ── Output bubble ──────────────────────────────────────────────────────────
function Output({ out }) {
  if (!out) return null;
  return (
    <View style={S.out}>
      <Text style={S.outLabel}>🎨 النتيجة</Text>
      {out.lines.map((l, i) => <Text key={i} style={S.outText}>{l}</Text>)}
    </View>
  );
}

// ── Kodi ───────────────────────────────────────────────────────────────────
function Kodi({ onPress }) {
  const b = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(b, { toValue: -6, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(b, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
      <Animated.Image source={require('../../assets/character.png')}
        style={{ width: 96, height: 96, resizeMode: 'contain', transform: [{ translateY: b }] }} />
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
export default function NubiaLessonScreen() {
  const { width: W, height: H } = useWindowDimensions();
  const [idx, setIdx] = useState(0);
  const [ready, setReady] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [phase, setPhase] = useState('play');   // 'play' | 'done'
  const [output, setOutput] = useState(null);
  const [solvedCode, setSolvedCode] = useState('');
  const [bubble, setBubble] = useState('');
  const [muted, setMuted] = useState(false);
  const stage = STAGES[Math.min(idx, STAGES.length - 1)];

  const speak = useCallback((text) => {
    if (muted || !text) return;
    try {
      Speech.stop();
      const clean = text.replace(/[\u{1F000}-\u{1FFFF}\u2600-\u27BF\u2B00-\u2BFF▶⬇️]/gu, '').replace(/\n/g, '. ').replace(/"/g, '');
      Speech.speak(clean, { language: 'ar', rate: 0.85 });
    } catch {}
  }, [muted]);

  const say = useCallback((text) => { setBubble(text); speak(text); }, [speak]);

  // load saved progress once
  useEffect(() => {
    (async () => {
      try {
        const saved = JSON.parse((await AsyncStorage.getItem(KEY)) || 'null');
        if (saved && saved.idx < STAGES.length) { setIdx(saved.idx); setMistakes(saved.mistakes || 0); }
      } catch {}
      setReady(true);
    })();
  }, []);

  // new stage → reset + Kodi speaks its line
  useEffect(() => {
    if (!ready) return;
    setPhase('play'); setOutput(null); say(stage.say);
    AsyncStorage.setItem(KEY, JSON.stringify({ idx, mistakes })).catch(() => {});
  }, [idx, ready]);

  const solved = (code) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch?.(() => {});
    setSolvedCode(code); setOutput(simulate(code)); setPhase('done'); say(pick(PRAISE));
  };
  const mistake = (msg) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch?.(() => {});
    setMistakes(m => m + 1); say(msg);
  };
  const runDemo = () => { setOutput(simulate(stage.code)); setPhase('done'); say(stage.after); };
  const next = () => setIdx(i => Math.min(i + 1, STAGES.length - 1));
  const restart = async () => { await AsyncStorage.removeItem(KEY).catch(() => {}); setMistakes(0); setIdx(0); };
  const askRestart = () => {
    if (Platform.OS === 'web') { if (window.confirm('نبدأ من الأول؟')) restart(); }
    else Alert.alert('نبدأ من الأول؟', '', [{ text: 'لأ', style: 'cancel' }, { text: 'أيوه ✅', onPress: restart }]);
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: '#2a1208' }} />;
  const stars = mistakes === 0 ? 3 : mistakes <= 3 ? 2 : 1;
  const total = STAGES.length;

  return (
    <ImageBackground source={require('../../assets/nubia.jpg')} resizeMode="cover" style={{ flex: 1, backgroundColor: '#2a1208' }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(30,12,4,0.30)' }]} />
      <Desert W={W} H={H} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* progress + buttons */}
        <View style={S.top}>
          <View style={S.dots}>
            {STAGES.map((_, i) => (
              <View key={i} style={[S.dot, i < idx && S.dotDone, i === idx && S.dotNow]} />
            ))}
          </View>
          <TouchableOpacity style={S.iconBtn} onPress={() => { setMuted(m => !m); Speech.stop(); }}>
            <Text style={{ fontSize: 16 }}>{muted ? '🔇' : '🔊'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.iconBtn} onPress={askRestart}><Text style={{ fontSize: 16 }}>🔄</Text></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={S.scroll} showsVerticalScrollIndicator={false}>
          {/* Kodi + short speech */}
          <View style={S.kodiRow}>
            <View style={S.bubble}>
              <Text style={S.bubbleText}>{bubble}</Text>
              <View style={S.tail} />
            </View>
            <Kodi onPress={() => speak(bubble)} />
          </View>

          {/* stage content */}
          <View style={S.card}>
            {stage.type === 'teach' && stage.show === 'parts' && <PartsVisual />}
            {stage.type === 'teach' && stage.show === 'house' && <HouseVisual />}
            {stage.type === 'teach' && !stage.show && <Text style={{ fontSize: 64, textAlign: 'center' }}>🐪🌴</Text>}

            {stage.type === 'demo' && (
              <View style={{ direction: 'ltr' }}><View style={S.codeBox}><Text style={S.codeText}>{stage.code}</Text></View></View>
            )}
            {stage.type === 'order' && phase === 'play' && <OrderPuzzle key={stage.id} stage={stage} onSolved={solved} onMistake={mistake} />}
            {stage.type === 'choice' && phase === 'play' && <ChoicePuzzle key={stage.id} stage={stage} onSolved={solved} onMistake={mistake} />}
            {stage.type === 'order' && phase === 'done' && (
              <View style={{ direction: 'ltr' }}><View style={S.codeBox}>
                <Text style={S.codeText}>{solvedCode}</Text>
              </View></View>
            )}
            {stage.type === 'wrap' && (
              <View style={{ alignItems: 'center', gap: 14 }}>
                <Text style={{ fontSize: 44, letterSpacing: 6 }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</Text>
                {stage.learned.map((l, i) => <Text key={i} style={S.learned}>✅ {l}</Text>)}
                <Text style={S.partLabel}>الدرس الجاي: صندوق الكنز 💎</Text>
              </View>
            )}
            <Output out={output} />
          </View>
        </ScrollView>

        {/* big action button */}
        <View style={S.footer}>
          {stage.type === 'teach' && <Btn label={stage.cta || 'التالي ▶'} onPress={next} />}
          {stage.type === 'demo' && (phase === 'play' ? <Btn label="شغّل ▶" color={C.good} onPress={runDemo} /> : <Btn label="التالي ▶" onPress={next} />)}
          {(stage.type === 'order' || stage.type === 'choice') && phase === 'done' && <Btn label="التالي ▶" onPress={next} />}
          {stage.type === 'wrap' && <Btn label="🔄 من الأول" onPress={restart} />}
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

function Btn({ label, onPress, color = C.primary }) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[S.btn, { backgroundColor: color }]}>
      <Text style={S.btnText}>{label}</Text>
    </TouchableOpacity>
  );
}

const S = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 6, gap: 8 },
  dots: { flex: 1, flexDirection: 'row-reverse', gap: 5, alignItems: 'center' },
  dot: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotDone: { backgroundColor: '#2dd4bf' },
  dotNow: { backgroundColor: C.gold },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(40,17,8,0.7)',
             alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  scroll: { padding: 16, paddingBottom: 24, gap: 16 },
  kodiRow: { alignItems: 'center', gap: 4 },
  bubble: { alignSelf: 'stretch', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 22, paddingVertical: 14, paddingHorizontal: 18 },
  bubbleText: { color: '#431407', fontSize: 21, lineHeight: 32, fontWeight: '700', textAlign: 'center' },
  tail: { position: 'absolute', bottom: -9, alignSelf: 'center', width: 18, height: 18, backgroundColor: 'rgba(255,255,255,0.95)',
          transform: [{ rotate: '45deg' }] },
  card: { backgroundColor: C.card, borderRadius: 24, padding: 18, borderWidth: 1, borderColor: C.border, gap: 16, minHeight: 120 },
  tile: { borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, alignItems: 'center' },
  tileText: { fontFamily: MONO, fontSize: 19, fontWeight: '700' },
  ghost: { borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'transparent' },
  slotsBox: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', padding: 10, marginBottom: 14,
              backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: 'rgba(255,255,255,0.3)' },
  slot: { minWidth: 46, minHeight: 50, alignItems: 'center', justifyContent: 'center' },
  slotNum: { color: 'rgba(255,255,255,0.35)', fontSize: 20, fontWeight: '800' },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  codeBox: { backgroundColor: 'rgba(28,12,6,0.92)', borderRadius: 14, padding: 16, borderWidth: 2, borderColor: '#2dd4bf' },
  codeText: { fontFamily: MONO, color: '#e6edf3', fontSize: 19, lineHeight: 28 },
  partLabel: { color: C.muted, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  house: { borderWidth: 4, borderColor: '#2dd4bf', borderTopLeftRadius: 40, borderTopRightRadius: 40, borderBottomLeftRadius: 8, borderBottomRightRadius: 8,
           backgroundColor: 'rgba(20,184,166,0.22)', paddingVertical: 16, paddingHorizontal: 26, alignItems: 'center', gap: 6, direction: 'ltr' },
  houseBand: { color: '#fbbf24', fontSize: 16, letterSpacing: 2 },
  out: { backgroundColor: 'rgba(255,247,237,0.96)', borderRadius: 18, padding: 14, gap: 4, borderWidth: 2, borderColor: '#fdba74' },
  outLabel: { color: '#9a3412', fontSize: 13, fontWeight: '800', textAlign: 'right' },
  outText: { color: '#431407', fontSize: 22, fontWeight: '700', textAlign: 'center' },
  learned: { color: C.text, fontSize: 18, fontWeight: '700' },
  footer: { paddingHorizontal: 16, paddingBottom: 12, paddingTop: 6, minHeight: 70, justifyContent: 'center' },
  btn: { height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
         shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
