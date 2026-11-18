// nubiaLesson01.js — Lesson 1, puzzle style. Arabic only. Almost no reading: tap, drag-order, choose.
//
// Stage types
//   teach  : say + optional visual (show: 'parts' | 'house')         → [cta]
//   demo   : say + code → press ▶ → output                           → [التالي]
//   order  : put tiles in the right order (decoys = extra wrong tiles)
//   choice : pick the working code out of 3
//
// Metaphor (Nubian village on the Nile):
//   print = Kodi paints a picture on the wall 🎨 · ( ) = the door 🚪 · " " = the Nubian house 🏠 that keeps the words safe
//   numbers = free travellers 🐪 who don't need a house

export const LESSON_META = { number: 1, titleAr: 'الدرس الأول — رسمة كودي على الحيطة 🎨' };

export const PRAISE = ['برافو! 🎉', 'أحسنت يا بطل! ⭐', 'صح! 🌟', 'جامد! 💪', 'ممتاز! 🐪'];

export const STAGES = [
  { id: 'welcome', type: 'teach',
    say: 'أهلاً! أنا كودي 🌴\nهنعلّم الكمبيوتر يتكلم!',
    cta: 'يلا! ▶' },

  { id: 'bubble', type: 'demo',
    say: 'الكمبيوتر بيرسم على حيطة البيت 🎨\nدوس شغّل!',
    code: 'print("☀️")',
    after: 'شُفت؟ print = رسمة على الحيطة 🎨' },

  { id: 'parts', type: 'teach', show: 'parts',
    say: 'السطر ده له 4 حتت 🧩' },

  { id: 'order_hello', type: 'order',
    say: 'رتّب الحتت عشان الرسمة تظهر على الحيطة! 🎨',
    hint: 'ابدأ بـ print 🖌️',
    solution: ['print', '(', '"Hello World"', ')'] },

  { id: 'house', type: 'teach', show: 'house',
    say: 'الكلام لازم يبقى جوا بيت " " 🏠' },

  { id: 'choice_quotes', type: 'choice',
    say: 'أي كود شغّال؟ 🤔',
    options: [
      { code: 'print("Hello World")', ok: true },
      { code: 'print(Hello World)', ok: false, why: 'الكلام برّه البيت! 🏠' },
      { code: 'print("Hello World"', ok: false, why: 'الباب مش مقفول! ناقصه ) 🚪' },
    ] },

  { id: 'order_arabic', type: 'order',
    say: 'بالعربي كمان! رتّب الحتت 🧩',
    hint: 'البيت " " بيحمي الكلام 🏠',
    solution: ['print', '(', '"أهلاً يا عالم"', ')'],
    decoys: ['{'] },

  { id: 'order_lines', type: 'order', layout: 'lines',
    say: 'الكمبيوتر بيقرا من فوق لتحت ⬇️\nرتّب القافلة: جمل، اتنين، تلاتة',
    hint: 'الجمل الواحد الأول 🐪',
    solution: ['print("🐪")', 'print("🐪🐪")', 'print("🐪🐪🐪")'] },

  { id: 'numbers', type: 'demo',
    say: 'الأرقام مسافرين أحرار 🐪\nمش محتاجين بيت. شغّل!',
    code: 'print(2 + 3)',
    after: 'الكمبيوتر حسبها! 2 + 3 = 5 ✨' },

  { id: 'choice_numbers', type: 'choice',
    say: 'أي كود يطلّع الرقم 5؟ 🔢',
    options: [
      { code: 'print(2 + 3)', ok: true },
      { code: 'print("2 + 3")', ok: false, why: 'البيت بيحبس الكلام — هيطبع 2 + 3 زي ما هو 🏠' },
      { code: 'print(2 +)', ok: false, why: 'الحساب ناقص! 🤏' },
    ] },

  { id: 'final', type: 'order',
    say: 'دورك! اطبع اسم جملك 🐪',
    hint: 'اسم جملك لازم يبقى جوا البيت " "',
    solution: ['print', '(', '"شمس"', ')'],
    accept: '^print\\("[^"]+"\\)$',
    decoys: ['"رمل"', '{'] },

  { id: 'wrap', type: 'wrap',
    say: 'برافو يا بطل! 🏆\nخلصت الدرس الأول!',
    learned: ['print = رسمة على الحيطة 🎨', 'الكلام جوا بيت " " 🏠', 'الأرقام من غير بيت 🐪'] },
];
