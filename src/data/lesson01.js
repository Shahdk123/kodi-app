// lesson01.js — Lesson 1: "Kodi the Fish" 🐠 (aquatic theme, ages ~7–13)
// Drop-in replacement for src/data/lesson01.js — same exports, same stage schema.
//
// Story metaphor used throughout:
//   print(...)      → Kodi blowing a bubble 🫧 onto the screen
//   ( )             → the fish's mouth
//   " "             → the aquarium glass that protects the words 🐠
//   numbers         → free swimmers, no tank needed 🔢

export const LESSON_META = {
  number: 1,
  titleAr: 'الدرس الأول — كودي والفقاعات! 🫧',
  titleEn: 'Lesson 1 — Kodi and the Bubbles!',
};

export const STAGES = [
  // 1 ─────────────────────────────────────────────────────────────
  {
    id: 'welcome', type: 'teach',
    contentAr: `أهلاً يا بطل! 🌊🐠\n\nأنا كودي، وساكن في محيط البرمجة مع أصحابي الأسماك!\n\nالنهاردة هنتعلم أول كلمة نكلّم بيها الكمبيوتر بلغة اسمها بايثون 🐍\n\nجاهز تغطس معايا؟ قول "يلا"!`,
    contentEn: `Hello champion! 🌊🐠\n\nI'm Kodi, and I live in the ocean of programming with my fish friends!\n\nToday we learn the first words to say to a computer, in a language called Python 🐍\n\nReady to dive in? Say "let's go"!`,
    codeExample: `# 🌊 أهلاً بيك في محيط بايثون!\n# Welcome to the Python ocean!\n\nprint("🌊 أنا كودي!")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 2 ─────────────────────────────────────────────────────────────
  {
    id: 'meet_print', type: 'teach',
    contentAr: `الكمبيوتر زي سمكة صغيرة 🐟 بتفهم لغة خاصة بيها بس.\n\nأول أمر هنتعلمه اسمه print — يعني "اطبع" أو "اظهر على الشاشة".\n\nتخيّل إن كودي بينفخ فقاعة 🫧 وجواها كلمة… الكمبيوتر بيطلّع الكلمة على الشاشة!\n\nاضغط ▶ وشوف الفقاعات!`,
    contentEn: `A computer is like a little fish 🐟 that only understands its own special language.\n\nThe first command is print — it means "show on the screen".\n\nImagine Kodi blowing a bubble 🫧 with a word inside… the computer shows that word on the screen!\n\nPress ▶ and watch the bubbles!`,
    codeExample: `print("🫧")\nprint("🫧 🫧")\nprint("🫧 🫧 🫧")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 3 ─────────────────────────────────────────────────────────────
  {
    id: 'hello_world', type: 'teach',
    contentAr: `دلوقتي أشهر سطر في العالم كله! 🌍✨\n\nprint("Hello World")\n\nمعناه: "يا كمبيوتر، اظهر كلمتين: Hello World" يعني "أهلاً يا عالم"!\n\nكل مبرمج في الدنيا بدأ بالسطر ده، وانت كمان دلوقتي! 🏆\n\nاضغط ▶ وشوف الفقاعة!`,
    contentEn: `Now the most famous line in the whole world! 🌍✨\n\nprint("Hello World")\n\nIt means: "Computer, show the words Hello World" — which means "hello, world"!\n\nEvery programmer on Earth started with this line, and now so do you! 🏆\n\nPress ▶ and see the bubble!`,
    codeExample: `print("Hello World")\nprint("أهلاً يا عالم! 🌊")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 4 ─────────────────────────────────────────────────────────────
  {
    id: 'anatomy', type: 'teach',
    contentAr: `يلا نفتح السمكة ونشوف جواها إيه! 🔍🐠\n\n🐟 print ← الأمر (كودي بينفخ)\n👄 ( ) ← الأقواس، فم السمكة\n🏠 " " ← علامات التنصيص، حوض السمك\n💬 Hello World ← الكلام اللي جوا الحوض\n\nكل حاجة لها مكان، ولازم الأربعة يبقوا موجودين!`,
    contentEn: `Let's look inside the fish! 🔍🐠\n\n🐟 print ← the command (Kodi blowing)\n👄 ( ) ← the brackets, the fish's mouth\n🏠 " " ← quotation marks, the aquarium\n💬 Hello World ← the words inside the tank\n\nEach part has its place, and you need all four!`,
    codeExample: `#  print   (   "Hello World"   )\n#   🐟     👄      🏠💬🏠      👄\n\nprint("Hello World")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 5 ─────────────────────────────────────────────────────────────
  {
    id: 'q_print', type: 'question',
    contentAr: `سؤال سهل يا بطل! 🤔\n\nprint() بتعمل إيه بالظبط؟`,
    contentEn: `Easy question champion! 🤔\n\nWhat exactly does print() do?`,
    codeExample: `print("الإجابة هنا على الشاشة 👇")`,
    keywords: ['يطبع','بيطبع','طباعة','تطبع','بتطبع','print','يكتب','بيكتب','يظهر','بيظهر','تظهر','بتظهر','يعرض','بيعرض','شاشة','نص','output','ناتج','يخرج','فقاعة','فقاعات','displays','display','shows','show','prints'],
    reaction: 'celebrate',
    hint: 'فكّر — لما ضغطت ▶، إيه اللي ظهر على الشاشة؟ 🫧',
  },

  // 6 ─────────────────────────────────────────────────────────────
  {
    id: 'teach_quotes', type: 'teach',
    contentAr: `مهم جداً! ⚠️🐠\n\nالكلام لازم يبقى جوا علامات التنصيص " " — دي زي حوض السمك، بتحمي الكلام جواها.\n\nبتقول لبايثون: "ده كلام عادي، مش أمر!"\n\nمن غير الحوض بايثون بيتلخبط وبيقول SyntaxError 😅\n\nجرّب تشيل علامة # وشوف الغلط!`,
    contentEn: `Very important! ⚠️🐠\n\nWords must be inside quotation marks " " — they're like the aquarium glass protecting the words.\n\nThey tell Python: "this is just text, not a command!"\n\nWithout the tank Python gets confused and says SyntaxError 😅\n\nTry removing the # sign and see the mistake!`,
    codeExample: `# ✅ صح — السمكة جوا الحوض\nprint("🐠 سمكتي جوا الحوض")\n\n# ❌ غلط — السمكة برّه الحوض!\n# (شيل علامة # من السطر الجاي وشوف)\n# print(سمكتي برّه الحوض)`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 7 ─────────────────────────────────────────────────────────────
  {
    id: 'q_quotes', type: 'question',
    contentAr: `إيه اللي بنحط الكلام جواه في print() عشان بايثون يفهمه؟ 🏠\n\n(تلميح: زي حوض السمك!)`,
    contentEn: `What do we put around the words inside print() so Python understands them? 🏠\n\n(Hint: like the aquarium!)`,
    codeExample: `print("🏠 الكلام جوا الحوض")`,
    keywords: ['تنصيص','علامات','علامة','quotes','quote','quotation','اقتباس','حوض','aquarium','""','" "'],
    reaction: 'celebrate',
    hint: 'اسمها "علامات ..." وشكلها " " — بتحمي الكلام زي الحوض! 🐠',
  },

  // 8 ─────────────────────────────────────────────────────────────
  {
    id: 'challenge_print', type: 'challenge',
    contentAr: `دلوقتي دورك انت! 🚀🐟\n\nاختار اسم لسمكتك واكتب في شاشة الكود:\n\nprint("اسم سمكتك")\n\nوبعدين اضغط ▶ وشوف الفقاعة بتاعتك!\n\nلما تخلص قول "خلصت" أو قول اسم السمكة! 🎉`,
    contentEn: `Now it's your turn! 🚀🐟\n\nPick a name for your fish and write in the code panel:\n\nprint("your fish's name")\n\nPress ▶ and see your own bubble!\n\nWhen done say "finished" or say your fish's name! 🎉`,
    codeExample: `# ✏️ غيّر الكلام جوا الحوض واكتب اسم سمكتك!\n\nprint("اسم سمكتي هنا 🐠")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 9 ─────────────────────────────────────────────────────────────
  {
    id: 'teach_numbers', type: 'teach',
    contentAr: `برافووو! 🎉 سمكتك بقت مشهورة!\n\nprint() مش للكلام بس — ممكن تطبع أرقام وحسابات كمان! 🔢\n\nالأرقام سبّاحين أحرار 🏊 مش محتاجين حوض، يعني مفيش علامات تنصيص.`,
    contentEn: `Bravo! 🎉 Your fish is famous now!\n\nprint() isn't just for words — it can show numbers and maths too! 🔢\n\nNumbers are free swimmers 🏊 — no tank needed, so no quotation marks.`,
    codeExample: `print(5)            # رقم حر 🏊\nprint(2 + 3)        # حسبة\nprint(10 * 10)\n\n# كلام + أرقام مع بعض\nprint("عندي", 5, "أسماك 🐠")`,
    keywords: [], reaction: 'celebrate', hint: null,
  },

  // 10 ────────────────────────────────────────────────────────────
  {
    id: 'q_numbers_quotes', type: 'question',
    contentAr: `الأرقام في print() محتاجة حوض (علامات تنصيص) ولا لأ؟ 🔢🏠`,
    contentEn: `Do numbers in print() need an aquarium (quotation marks) or not? 🔢🏠`,
    codeExample: `print(42)        # ✅ رقم حر\nprint("42")      # 🏠 ده كلام مش رقم\nprint(42 + 8)    # حسبة`,
    keywords: ['لا','لأ','لأه','no','nope','مش محتاجة','مش محتاج','بدون','من غير','مفيش','directly','مباشرة'],
    reaction: 'celebrate',
    hint: 'بص على الكود — الرقم 42 الأولاني جوا حوض ولا لأ؟',
  },

  // 11 ────────────────────────────────────────────────────────────
  {
    id: 'wrap_up', type: 'teach',
    contentAr: `مبروك يا بطل! 🎊🐠\n\nخلصت الدرس الأول!\n\n✅ عرفت إن print بتنفخ فقاعات على الشاشة\n✅ كتبت print("Hello World")\n✅ عرفت إن الكلام محتاج حوض " "\n✅ عرفت إن الأرقام سبّاحين أحرار\n\nالدرس الجاي: صندوق الكنز اللي بنخزّن فيه الحاجات — المتغيرات! 💎`,
    contentEn: `Congratulations champion! 🎊🐠\n\nYou finished Lesson 1!\n\n✅ print blows bubbles on the screen\n✅ You wrote print("Hello World")\n✅ Words need an aquarium " "\n✅ Numbers are free swimmers\n\nNext: the treasure chest where we store things — Variables! 💎`,
    codeExample: `# 🏆 اللي اتعلمته:\nprint("Hello World")\nprint("أهلاً يا عالم! 🌊")\nprint(2 + 3)\n\n# 💎 الدرس الجاي: المتغيرات\nfish = "كودي"\nprint("أهلاً يا", fish)`,
    keywords: [], reaction: 'celebrate', hint: null,
  },
];
