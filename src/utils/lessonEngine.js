// lessonEngine.js — all lesson logic on-device (ported from character.py)
// No server needed. Pure JS functions, no side effects.

import { STAGES } from '../data/lesson01';

const CORRECT_FEEDBACK_AR = [
  'صح تماماً! 🎯 إجابة ممتازة!',
  'برافووو! 🌊 ده بالظبط الصح!',
  'نجمة! ⭐ إجابتك صح!',
  'ممتاز يا بطل! 🎉 يلا نكمل!',
  'أحسنت! 💪 كمّل معايا!',
];
const CORRECT_FEEDBACK_EN = [
  'Exactly right! 🎯 Great answer!',
  'Bravo! 🌊 That\'s exactly correct!',
  'Star! ⭐ Your answer is right!',
  'Excellent! 🎉 Let\'s continue!',
  'Well done! 💪 Keep going!',
];
const TEACH_FEEDBACK_AR = [
  'ممتاز يا بطل! 🎉 يلا نكمل!',
  'برافو عليك! 🌟 الخطوة الجاية جاهزة!',
  'أحسنت! 💪 كمّل معايا!',
  'عظيم! 🚀 إنت بتتعلم بسرعة!',
];
const TEACH_FEEDBACK_EN = [
  'Excellent! 🎉 Let\'s continue!',
  'Bravo! 🌟 Next step is ready!',
  'Well done! 💪 Keep going!',
  'Amazing! 🚀 You\'re learning fast!',
];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/** Create a fresh lesson state */
export function getInitialState() {
  return {
    stageIdx:  0,
    wrongAttempts: 0,
    complete:  false,
    language:  'bilingual', // 'ar' | 'en' | 'bilingual'
  };
}

/** Get the current stage dict */
export function getCurrentStage(state) {
  if (state.stageIdx >= STAGES.length) return STAGES[STAGES.length - 1];
  return STAGES[state.stageIdx];
}

/**
 * Process a child's message against the current stage.
 * Returns { responseAr, responseEn, animation, newState, isCorrect }
 * Mutates nothing — returns a NEW state object.
 */
export function processMessage(state, input) {
  const stage = getCurrentStage(state);
  const text  = input.trim().toLowerCase();

  // ── Teach / Challenge: always correct ─────────────────────────────────────
  if (stage.type === 'teach' || stage.type === 'challenge') {
    const newState = {
      ...state,
      stageIdx:      state.stageIdx + 1,
      wrongAttempts: 0,
      complete:      state.stageIdx + 1 >= STAGES.length,
    };
    return {
      responseAr: pick(TEACH_FEEDBACK_AR),
      responseEn: pick(TEACH_FEEDBACK_EN),
      animation:  stage.reaction === 'celebrate' ? 'celebrating' : 'talking',
      isCorrect:  true,
      newState,
    };
  }

  // ── Question: keyword match ────────────────────────────────────────────────
  const NEGATIVES = ['لا','لأ','لأه','no','nope','بدون','من غير','مفيش','مش محتاج'];
  const matched = stage.keywords.some(kw => text.includes(kw.toLowerCase()))
               || NEGATIVES.some(n => text.includes(n));

  if (matched) {
    const newState = {
      ...state,
      stageIdx:      state.stageIdx + 1,
      wrongAttempts: 0,
      complete:      state.stageIdx + 1 >= STAGES.length,
    };
    return {
      responseAr: pick(CORRECT_FEEDBACK_AR),
      responseEn: pick(CORRECT_FEEDBACK_EN),
      animation:  'celebrating',
      isCorrect:  true,
      newState,
    };
  }

  // Wrong answer
  const hintAr = stage.hint ? ` 💡 تلميح: ${stage.hint}` : '';
  const hintEn = stage.hint ? ` 💡 Hint: ${stage.hint}` : '';
  return {
    responseAr: `مش بعيد! حاول تاني 🤔${hintAr}`,
    responseEn: `Not far off! Try again 🤔${hintEn}`,
    animation:  'encouraging',
    isCorrect:  false,
    newState: { ...state, wrongAttempts: state.wrongAttempts + 1 },
  };
}

/** Get the opening message for current stage */
export function getOpeningMessage(state) {
  const stage = getCurrentStage(state);
  return {
    responseAr: stage.contentAr,
    responseEn: stage.contentEn,
    codeExample: stage.codeExample,
  };
}

export { STAGES };
