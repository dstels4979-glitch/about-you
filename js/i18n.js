/**
 * I18N
 * ----
 * Everything needed to support three interface languages: ru / uz / en.
 *
 * Two kinds of translated text exist in this project:
 *  1. Content that lives in js/data.js (theme titles, question prompts,
 *     option labels, placeholders…). Those are plain objects shaped like
 *     { ru: "...", uz: "...", en: "..." }. Use I18N.tr(obj, lang) to read
 *     the right one (falls back to ru, then to any available value).
 *  2. Fixed interface strings (button labels, toasts, progress text…)
 *     that don't belong to any single question. Those live below in
 *     UI_STRINGS and are read with I18N.t(lang, key, vars).
 *
 * Supported languages are listed in I18N.LANGS — add a 4th language by
 * adding it there, adding its column to UI_STRINGS, and adding its key to
 * every translation object in data.js.
 */

const I18N = (() => {
  const LANGS = [
    { code: "ru", label: "RU", name: "Русский" },
    { code: "uz", label: "UZ", name: "O'zbekcha" },
    { code: "en", label: "EN", name: "English" },
  ];

  const DEFAULT_LANG = "ru";

  const UI_STRINGS = {
    ru: {
      chooseLanguageTitle: "Выберите язык",
      chooseLanguageText: "На каком языке тебе удобнее пройти анкету?",
      next: "Далее",
      back: "Назад",
      addCustom: "+ Добавить свой вариант",
      customPlaceholder: "Свой вариант…",
      addConfirm: "Добавить",
      defaultTextPlaceholder: "Твой ответ…",
      defaultTextareaPlaceholder: "Пиши сколько угодно…",
      progress: (step, total, pct) => `Шаг ${step} из ${total} · ${pct}% завершено`,
      sending: "Отправляю ответы…",
      sentOk: "Ответы доставлены ✓",
      sendError: "Не получилось отправить 😔 Нажми, чтобы попробовать снова",
      retry: "Попробовать снова",
    },
    uz: {
      chooseLanguageTitle: "Tilni tanlang",
      chooseLanguageText: "Anketani qaysi tilda topshirish senga qulay?",
      next: "Davom etish",
      back: "Orqaga",
      addCustom: "+ O'z variantingizni qo'shing",
      customPlaceholder: "O'z variantingiz…",
      addConfirm: "Qo'shish",
      defaultTextPlaceholder: "Javobing…",
      defaultTextareaPlaceholder: "Xohlagancha yoz…",
      progress: (step, total, pct) => `${step}-qadam, jami ${total} ta · ${pct}% bajarildi`,
      sending: "Javoblar yuborilmoqda…",
      sentOk: "Javoblar yetkazildi ✓",
      sendError: "Yuborib bo'lmadi 😔 Qayta urinish uchun bosing",
      retry: "Qayta urinish",
    },
    en: {
      chooseLanguageTitle: "Choose your language",
      chooseLanguageText: "Which language is most comfortable for you?",
      next: "Next",
      back: "Back",
      addCustom: "+ Add your own option",
      customPlaceholder: "Your own option…",
      addConfirm: "Add",
      defaultTextPlaceholder: "Your answer…",
      defaultTextareaPlaceholder: "Write as much as you like…",
      progress: (step, total, pct) => `Step ${step} of ${total} · ${pct}% complete`,
      sending: "Sending your answers…",
      sentOk: "Answers delivered ✓",
      sendError: "Couldn't send 😔 Tap to try again",
      retry: "Try again",
    },
  };

  // Reads a fixed interface string. `value` may be a plain string or a
  // function (used for the progress text, which takes arguments).
  function t(lang, key, ...args) {
    const table = UI_STRINGS[lang] || UI_STRINGS[DEFAULT_LANG];
    const value = table[key] !== undefined ? table[key] : UI_STRINGS[DEFAULT_LANG][key];
    return typeof value === "function" ? value(...args) : value;
  }

  // Reads a translated content object from data.js, e.g. tr(question.prompt, "uz").
  function tr(obj, lang) {
    if (obj == null) return "";
    if (typeof obj === "string") return obj; // already plain text (e.g. user free-text)
    return obj[lang] || obj[DEFAULT_LANG] || Object.values(obj)[0] || "";
  }

  return { LANGS, DEFAULT_LANG, UI_STRINGS, t, tr };
})();
