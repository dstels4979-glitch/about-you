/**
 * STORE
 * -----
 * Tiny persistence layer. Keeps all answers + current position in
 * localStorage so a refresh never loses progress.
 */

const STORAGE_KEY = "quiz_progress_v1";

const Store = {
  state: {
    screenIndex: 0,
    answers: {}, // questionId -> value (string | string[] | {value, sugar} | ...)
    skipped: {}, // questionId -> true, for branch-skipped questions
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

  reset() {
    this.state = { screenIndex: 0, answers: {}, skipped: {} };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* noop */
    }
  },
};
