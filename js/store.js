/**
 * STORE
 * -----
 * Tiny persistence layer. Keeps all answers + current position in
 * localStorage so a refresh never loses progress. Also remembers the
 * chosen interface language and whether the results were already
 * delivered to Telegram (so we never send duplicates on refresh).
 */

const STORAGE_KEY = "quiz_progress_v1";

const Store = {
  state: {
    screenIndex: 0,
    answers: {}, // questionId -> value (string | {selected,sub,custom} | {text,checked} | ...)
    skipped: {}, // questionId -> true, for branch-skipped questions
    lang: null, // "ru" | "uz" | "en" | null (not chosen yet)
    sent: false, // true once results were successfully delivered to Telegram
  },

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.state = { ...this.state, ...parsed };
      }
    } catch (e) {
      console.warn("Could not read saved progress:", e);
    }
    return this.state;
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn("Could not save progress:", e);
    }
  },

  setAnswer(questionId, value) {
    this.state.answers[questionId] = value;
    this.save();
  },

  getAnswer(questionId) {
    return this.state.answers[questionId];
  },

  markSkipped(questionId) {
    this.state.skipped[questionId] = true;
    this.save();
  },

  isSkipped(questionId) {
    return !!this.state.skipped[questionId];
  },

  setScreenIndex(index) {
    this.state.screenIndex = index;
    this.save();
  },

  getScreenIndex() {
    return this.state.screenIndex;
  },

  getLang() {
    return this.state.lang;
  },

  setLang(lang) {
    this.state.lang = lang;
    this.save();
  },

  isSent() {
    return !!this.state.sent;
  },

  markSent() {
    this.state.sent = true;
    this.save();
  },

  reset() {
    this.state = { screenIndex: 0, answers: {}, skipped: {}, lang: null, sent: false };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
  },
};
