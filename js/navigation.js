/**
 * NAVIGATION
 * ----------
 * Turns the THEMES config into one flat, ordered list of screens:
 *   [welcome, ...every question of every theme in order..., final]
 *
 * Branching (see data.js `branch`) is handled by marking certain question
 * ids as "skipped" in the Store once a branch fires, then simply excluding
 * skipped questions whenever we compute the next/previous screen. This
 * means the underlying screen list never has to change shape at runtime.
 */

const Navigation = (() => {
  const flatScreens = [];

  // Always the very first screen. Users who already picked a language in a
  // previous session simply resume past it (their saved screenIndex is
  // already further along), so this never gets in the way of returning users.
  flatScreens.push({ kind: "language" });

  flatScreens.push({ kind: "welcome" });

  THEMES.forEach((theme, themeIndex) => {
    theme.questions.forEach((question, questionIndex) => {
      flatScreens.push({
        kind: "question",
        themeIndex,
        questionIndex,
        theme,
        question,
        isFirstOfTheme: questionIndex === 0,
      });
    });
  });

  flatScreens.push({ kind: "final" });

  const totalQuestionCount = flatScreens.filter((s) => s.kind === "question").length;

  function isScreenSkipped(screen) {
    return screen.kind === "question" && Store.isSkipped(screen.question.id);
  }

  function nextIndex(fromIndex) {
    let i = fromIndex + 1;
    while (i < flatScreens.length && isScreenSkipped(flatScreens[i])) i++;
    return i;
  }

  function prevIndex(fromIndex) {
    let i = fromIndex - 1;
    while (i >= 0 && isScreenSkipped(flatScreens[i])) i--;
    return i;
  }

  // Index of the first (non-skipped) question of the theme *after* the one
  // containing `fromIndex`. Used to jump forward after a branch fires.
  function nextThemeStartIndex(fromIndex) {
    const currentTheme = flatScreens[fromIndex].themeIndex;
    let i = fromIndex + 1;
    while (i < flatScreens.length) {
      const s = flatScreens[i];
      if (s.kind === "final") return i;
      if (s.kind === "question" && s.themeIndex !== currentTheme && !isScreenSkipped(s)) return i;
      i++;
    }
    return flatScreens.length - 1;
  }

  function getScreen(index) {
    return flatScreens[Math.max(0, Math.min(index, flatScreens.length - 1))];
  }

  function progressFor(index) {
    const screen = getScreen(index);
    if (screen.kind !== "question") return null;
    const answeredSoFar = flatScreens
      .slice(0, index + 1)
      .filter((s) => s.kind === "question" && !isScreenSkipped(s)).length;
    const total = totalQuestionCount - Object.keys(Store.state.skipped).length;
    return { step: answeredSoFar, total: Math.max(total, answeredSoFar) };
  }

  return {
    flatScreens,
    getScreen,
    nextIndex,
    prevIndex,
    nextThemeStartIndex,
    progressFor,
    lastIndex: flatScreens.length - 1,
  };
})();
