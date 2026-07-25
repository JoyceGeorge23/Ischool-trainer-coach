// Page-level language switcher (UI chrome only).
// The chatbot's own replies stay driven by the language of each question —
// see the per-turn directive in server.js. Switching here never touches the chat.
(function () {
  const STORAGE_KEY = "ischool-ui-lang";

  const STRINGS = {
    en: {
      "app.title": "iSchool Trainer Coach",
      "app.subtitle": "Trainer Coach",
      "nav.framework": "Trainer Skills Framework",
      "chat.sub": "Internal assistant to help iSchool tutors improve session delivery",

      "welcome.lead": "Welcome 👋",
      "welcome.body":
        "I help tutors with the trainer skills framework. Ask about teaching, presentation, communication or management skills — or just describe what happened in your session. I answer only from the official framework.",

      "s.soft.t": "Soft Skills",
      "s.soft.d": "The four core disciplines every session draws on",
      "s.teaching.t": "Teaching Skills",
      "s.pres.t": "Presentation Skills",
      "s.pres.d2": "How you structure and deliver an explanation",
      "s.comm.t": "Communication Skills",
      "s.mgmt.t": "Management Skills",
      "s.mgmt.d2": "Keeping the session on time and on track",
      "s.time.t": "Time & Priority Control",
      "s.flow.t": "Session Flow Control",
      "s.adaptability.t": "Adaptability & Problem-Solving",
      "s.accountability.t": "Accountability & Reliability",
      "s.struct.t": "Structural Thinking",
      "s.presence.t": "Visual & Nonverbal Presence",
      "s.verbal.t": "Verbal Control",
      "s.framing.t": "Framing & Positioning",
      "s.student.t": "Student Behavior",
      "s.student.d": "Reading what a learner is doing, and why",
      "s.attention.t": "Attention-Driven",
      "s.emotion.t": "Emotion-Driven",
      "s.motivation.t": "Motivation-Driven",
      "s.cognitive.t": "Cognitive-Driven",

      "input.placeholder": "Ask about teaching, presentation, communication or management skills…",
      "hint.press": "Press",
      "hint.send": "to send",
      "hint.newline": "for a new line",

      "a.openMenu": "Open skills menu",
      "a.switchLang": "Switch language",
      "a.send": "Send message",
      "a.messageLabel": "Message the trainer coach",

      "_switchTo": "العربية",
    },

    ar: {
      "app.title": "مدرب آي سكول",
      "app.subtitle": "مدرب المدربين",
      "nav.framework": "إطار مهارات المدرب",
      "chat.sub": "مساعد داخلي لمساعدة مدربي آي سكول على تحسين أداء الحصة",

      "welcome.lead": "أهلاً 👋",
      "welcome.body":
        "بساعد المدربين في إطار مهارات التدريب. اسألني عن مهارات التدريس، أو العرض والتقديم، أو التواصل، أو الإدارة — أو احكيلي بس اللي حصل في الحصة. بجاوب من الإطار الرسمي بس.",

      "s.soft.t": "المهارات الشخصية",
      "s.soft.d": "المجالات الأربعة الأساسية اللي أي حصة بتعتمد عليها",
      "s.teaching.t": "مهارات التدريس",
      "s.pres.t": "مهارات العرض والتقديم",
      "s.pres.d2": "إزاي ترتّب شرحك وتوصّله",
      "s.comm.t": "مهارات التواصل",
      "s.mgmt.t": "مهارات الإدارة",
      "s.mgmt.d2": "تخلي الحصة في وقتها وماشية صح",
      "s.time.t": "التحكم في الوقت والأولويات",
      "s.flow.t": "التحكم في إيقاع الحصة",
      "s.adaptability.t": "المرونة وحل المشكلات",
      "s.accountability.t": "المسؤولية والموثوقية",
      "s.struct.t": "التفكير البنائي",
      "s.presence.t": "الحضور البصري وغير اللفظي",
      "s.verbal.t": "التحكم الصوتي",
      "s.framing.t": "التأطير والتموضع",
      "s.student.t": "سلوك الطالب",
      "s.student.d": "تفهم الطالب بيعمل إيه، وليه",
      "s.attention.t": "مدفوع بالانتباه",
      "s.emotion.t": "مدفوع بالمشاعر",
      "s.motivation.t": "مدفوع بالدافعية",
      "s.cognitive.t": "مدفوع بالإدراك",

      "input.placeholder": "اسأل عن مهارات التدريس أو العرض والتقديم أو التواصل أو الإدارة…",
      "hint.press": "اضغط",
      "hint.send": "للإرسال",
      "hint.newline": "لسطر جديد",

      "a.openMenu": "فتح قائمة المهارات",
      "a.switchLang": "تغيير اللغة",
      "a.send": "إرسال الرسالة",
      "a.messageLabel": "راسل مدرب المدربين",

      "_switchTo": "English",
    },
  };

  function apply(lang) {
    const dict = STRINGS[lang] || STRINGS.en;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const value = dict[el.dataset.i18n];
      if (value != null) el.textContent = value;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const value = dict[el.dataset.i18nPlaceholder];
      if (value != null) el.placeholder = value;
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const value = dict[el.dataset.i18nAriaLabel];
      if (value != null) el.setAttribute("aria-label", value);
    });

    // Static bubbles (the welcome message) are written by this file rather
    // than by app.js, so nothing else tags them with .rtl — do it here.
    document.querySelectorAll("[data-i18n-bubble]").forEach((el) => {
      el.classList.toggle("rtl", lang === "ar");
      if (lang === "ar") el.lang = "ar";
      else el.removeAttribute("lang");
    });

    // Buttons show the language you'd switch TO, not the current one — and
    // the label is always in the other language, so it needs its own `lang`
    // or a screen reader reads it in the page's voice.
    const otherLang = lang === "ar" ? "en" : "ar";
    document.querySelectorAll("[data-lang-label]").forEach((el) => {
      el.textContent = dict._switchTo;
      el.lang = otherLang;
    });

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      /* private mode — the switch still works for this visit */
    }
  }

  let current = "en";
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") current = saved;
  } catch (e) {
    /* ignore */
  }

  function toggle() {
    current = current === "en" ? "ar" : "en";
    apply(current);
  }

  document.addEventListener("DOMContentLoaded", () => {
    apply(current);
    document.querySelectorAll("#langSwitch, #langSwitchMobile").forEach((btn) => {
      btn.addEventListener("click", toggle);
    });
  });

  window.iSchoolUILang = { get: () => current, set: apply, toggle };
})();
