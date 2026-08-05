/**
 * APP
 * ---
 * Wires Store + Navigation + Renderer + Telegram together: draws whichever
 * screen is current, animates between screens, applies the active theme's
 * palette, drives the progress indicator, handles the language screen +
 * persistent language switcher, and delivers the finished quiz to Telegram
 * once the final screen is reached.
 */

(function () {
  const root = document.getElementById("screen-root");
  const progressFill = document.getElementById("progress-bar-fill");
  const progressText = document.getElementById("progress-text");
  const progressWrap = document.getElementById("progress-wrap");
  const langSwitchButtons = Array.from(document.querySelectorAll(".lang-switch__btn"));
  const bgLayers = [document.getElementById("bg-layer-a"), document.getElementById("bg-layer-b")];
  let activeBgIndex = 0;
  let currentBgUrl = null;

  Store.load();
  let currentIndex = clampToValidScreen(Store.getScreenIndex());

  function currentLang() {
    return Store.getLang() || I18N.DEFAULT_LANG;
  }

  function clampToValidScreen(index) {
    // If a saved index landed on a since-skipped question, roll forward.
    let i = index;
    const screen = Navigation.getScreen(i);
    if (screen.kind === "question" && Store.isSkipped(screen.question.id)) {
      i = Navigation.nextIndex(i);
    }
    return i;
  }

  function applyTheme(themeTokens) {
    const body = document.body;
    if (!themeTokens) {
      body.style.removeProperty("--theme-primary");
      body.style.removeProperty("--theme-secondary");
      body.style.removeProperty("--theme-accent");
      body.style.removeProperty("--theme-bg-from");
      body.style.removeProperty("--theme-bg-to");
      return;
    }
    body.style.setProperty("--theme-primary", themeTokens.primary);
    body.style.setProperty("--theme-secondary", themeTokens.secondary);
    body.style.setProperty("--theme-accent", themeTokens.accent);
    body.style.setProperty("--theme-bg-from", themeTokens.bgFrom);
    body.style.setProperty("--theme-bg-to", themeTokens.bgTo);
  }

  // Which photo (if any) belongs behind this screen. Checked in order:
  // the question's own backgroundImage, then its theme's, then the
  // welcome/final screen's — falling back to `null` (plain colour
  // gradient) when nobody has set an image yet.
  function resolveBackgroundImage(screen) {
    if (screen.kind === "language" || screen.kind === "welcome") {
      return WELCOME_SCREEN.backgroundImage || null;
    }
    if (screen.kind === "final") {
      return FINAL_SCREEN.backgroundImage || null;
    }
    if (screen.kind === "question") {
      return screen.question.backgroundImage || screen.theme.backgroundImage || null;
    }
    return null;
  }

  // Crossfades the fixed full-page photo layer to a new image (or fades
  // it out entirely when `url` is null, revealing the plain colour
  // gradient). No-ops when the same image is already showing, so
  // re-rendering the current screen (e.g. on a language switch) never
  // causes a visible flicker.
  function applyBackgroundImage(url) {
    if (url === currentBgUrl) return;
    currentBgUrl = url;

    if (!url) {
      bgLayers.forEach((layer) => layer.classList.remove("bg-image-layer--visible"));
      return;
    }

    const nextIndex = 1 - activeBgIndex;
    const nextLayer = bgLayers[nextIndex];
    const currentLayer = bgLayers[activeBgIndex];

    nextLayer.style.backgroundImage = `url("${url}")`;
    // force a layout pass so the browser paints the new image before we
    // animate its opacity in — otherwise the fade-in can get skipped
    void nextLayer.offsetWidth;
    nextLayer.classList.add("bg-image-layer--visible");
    currentLayer.classList.remove("bg-image-layer--visible");
    activeBgIndex = nextIndex;
  }

  function updateProgress(index) {
    const progress = Navigation.progressFor(index);
    if (!progress) {
      progressWrap.classList.add("progress-wrap--hidden");
      return;
    }
    progressWrap.classList.remove("progress-wrap--hidden");
    const pct = Math.round((progress.step / progress.total) * 100);
    progressFill.style.width = pct + "%";
    progressText.textContent = I18N.t(currentLang(), "progress", progress.step, progress.total, pct);
  }

  function updateLangSwitchActive() {
    const active = currentLang();
    langSwitchButtons.forEach((btn) => {
      btn.classList.toggle("lang-switch__btn--active", btn.dataset.lang === active);
    });
  }

  function setLanguage(lang) {
    Store.setLang(lang);
    updateLangSwitchActive();
    renderScreen(currentIndex); // re-draw current screen's text in the new language, no transition
  }

  langSwitchButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });
  updateLangSwitchActive();

  // Guards the final screen against firing a second Telegram delivery
  // while one is already in flight (e.g. if the language switcher is
  // clicked, re-rendering the final screen, while sending is pending).
  let telegramSendInProgress = false;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function goTo(index, { skipAnimation } = {}) {
    const outgoing = root.firstElementChild;
    const finish = () => {
      currentIndex = index;
      Store.setScreenIndex(index);
      renderScreen(index);
    };
    if (outgoing && !skipAnimation) {
      outgoing.classList.add("screen--leaving");
      setTimeout(finish, 220);
    } else {
      finish();
    }
  }

  // Wipes all saved answers/progress/sent-status and sends the person back
  // to the very first screen. Used by the "Start over" link on the final
  // screen, so a returning visitor isn't stuck re-clicking "Back" through
  // 44 questions just to fill the quiz out again.
  function restart() {
    Store.reset();
    telegramSendInProgress = false;
    updateLangSwitchActive();
    goTo(0, { skipAnimation: true });
  }

  function renderScreen(index) {
    root.innerHTML = "";
    const screen = Navigation.getScreen(index);
    applyBackgroundImage(resolveBackgroundImage(screen));

    if (screen.kind === "language") {
      applyTheme(null);
      root.appendChild(buildLanguageScreen());
    } else if (screen.kind === "welcome") {
      applyTheme(null);
      root.appendChild(buildWelcomeScreen());
    } else if (screen.kind === "final") {
      applyTheme(null);
      root.appendChild(buildFinalScreen());
    } else if (screen.kind === "question") {
      applyTheme(screen.theme.theme);
      root.appendChild(buildQuestionScreen(screen));
    }

    updateProgress(index);
    requestAnimationFrame(() => {
      root.firstElementChild.classList.add("screen--entering");
    });
  }

  function buildLanguageScreen() {
    const screen = el("section", "screen screen--welcome screen--language");
    screen.appendChild(el("h1", "welcome-title", I18N.t(currentLang(), "chooseLanguageTitle")));
    screen.appendChild(el("p", "welcome-text", I18N.t(currentLang(), "chooseLanguageText")));

    const optionsWrap = el("div", "language-options");
    I18N.LANGS.forEach((langInfo) => {
      const btn = el("button", "language-card", langInfo.name);
      btn.type = "button";
      if (Store.getLang() === langInfo.code) btn.classList.add("language-card--selected");
      btn.addEventListener("click", () => {
        Store.setLang(langInfo.code);
        updateLangSwitchActive();
        goTo(Navigation.nextIndex(currentIndex));
      });
      optionsWrap.appendChild(btn);
    });
    screen.appendChild(optionsWrap);

    return screen;
  }

  function buildWelcomeScreen() {
    const L = currentLang();
    const screen = el("section", "screen screen--welcome");
    screen.appendChild(el("h1", "welcome-title", I18N.tr(WELCOME_SCREEN.title, L)));
    screen.appendChild(el("p", "welcome-text", I18N.tr(WELCOME_SCREEN.text, L)));
    const startBtn = el("button", "cta-button", I18N.tr(WELCOME_SCREEN.cta, L));
    startBtn.type = "button";
    startBtn.addEventListener("click", () => goTo(Navigation.nextIndex(currentIndex)));
    screen.appendChild(startBtn);
    return screen;
  }

  function buildFinalScreen() {
    const L = currentLang();
    const screen = el("section", "screen screen--final");
    screen.appendChild(el("h1", "final-title", I18N.tr(FINAL_SCREEN.title, L)));
    screen.appendChild(el("p", "final-text", I18N.tr(FINAL_SCREEN.text, L)));

    const statusText = el("p", "final-status", "");
    screen.appendChild(statusText);

    const doneBtn = el("button", "cta-button", I18N.tr(FINAL_SCREEN.cta, L));
    doneBtn.type = "button";
    screen.appendChild(doneBtn);

    function setStatus(text, variant) {
      statusText.textContent = text;
      statusText.className = "final-status" + (variant ? ` final-status--${variant}` : "");
    }

    function attemptSend() {
      if (telegramSendInProgress) return;
      telegramSendInProgress = true;
      doneBtn.disabled = true;
      setStatus(I18N.t(L, "sending"), "pending");
      Telegram.send()
        .then(() => {
          telegramSendInProgress = false;
          Store.markSent();
          setStatus(I18N.t(L, "sentOk"), "ok");
          doneBtn.textContent = I18N.tr(FINAL_SCREEN.cta, L);
          doneBtn.disabled = true;
        })
        .catch((err) => {
          telegramSendInProgress = false;
          console.warn("Telegram delivery failed:", err);
          setStatus(I18N.t(L, "sendError"), "error");
          doneBtn.textContent = I18N.t(L, "retry");
          doneBtn.disabled = false;
        });
    }

    if (Store.isSent()) {
      setStatus(I18N.t(L, "sentOk"), "ok");
      doneBtn.disabled = true;
    } else if (telegramSendInProgress) {
      setStatus(I18N.t(L, "sending"), "pending");
      doneBtn.disabled = true;
    } else {
      // Deliver automatically as soon as the final screen is reached —
      // no extra click required. The button becomes a manual retry if it
      // failed (e.g. no network), and stays disabled once delivery succeeds.
      attemptSend();
    }

    doneBtn.addEventListener("click", () => {
      if (!Store.isSent()) attemptSend();
    });

    const restartLink = el("button", "final-restart", I18N.t(L, "restart"));
    restartLink.type = "button";
    restartLink.addEventListener("click", () => {
      if (window.confirm(I18N.t(L, "restartConfirm"))) restart();
    });
    screen.appendChild(restartLink);

    return screen;
  }

  function buildInterstitial(text, onDone) {
    const screen = el("section", "screen screen--interstitial");
    screen.appendChild(el("p", "interstitial-text", text));
    root.innerHTML = "";
    root.appendChild(screen);
    requestAnimationFrame(() => screen.classList.add("screen--entering"));
    setTimeout(onDone, 1400);
  }

  function buildQuestionScreen(screen) {
    const L = currentLang();
    const { theme, question } = screen;
    const wrapper = el("section", "screen screen--question");

    if (screen.isFirstOfTheme) {
      const header = el("div", "theme-header");
      const emoji = el("div", "theme-header__emoji", theme.emoji);
      const title = el("h2", "theme-header__title", I18N.tr(theme.title, L));
      header.appendChild(emoji);
      header.appendChild(title);
      if (theme.themeImage) {
        const img = el("div", "theme-header__image");
        img.style.backgroundImage = `url(${theme.themeImage})`;
        header.appendChild(img);
      }
      wrapper.appendChild(header);
    }

    wrapper.appendChild(el("h3", "question-prompt", I18N.tr(question.prompt, L)));

    const fieldWrap = el("div", "question-field");
    wrapper.appendChild(fieldWrap);

    const nav = el("div", "screen-nav");
    const backBtn = el("button", "nav-button nav-button--back", I18N.t(L, "back"));
    backBtn.type = "button";
    const nextBtn = el("button", "nav-button nav-button--next", I18N.t(L, "next"));
    nextBtn.type = "button";
    nextBtn.disabled = true;

    backBtn.addEventListener("click", () => {
      const target = Navigation.prevIndex(currentIndex);
      goTo(Math.max(target, 0));
    });

    let latestValue = Store.getAnswer(question.id);

    nextBtn.addEventListener("click", () => {
      handleAdvance(screen, latestValue);
    });

    Renderer.render(question, fieldWrap, {
      onValidityChange: (valid) => {
        nextBtn.disabled = !valid;
      },
      onAnswered: (value) => {
        latestValue = value;
      },
    });

    nav.appendChild(backBtn);
    nav.appendChild(nextBtn);
    wrapper.appendChild(nav);
    return wrapper;
  }

  function handleAdvance(screen, answerValue) {
    const { question } = screen;
    if (question.type === "yesno-branch" && question.branch && answerValue === question.branch.on) {
      question.branch.skip.forEach((id) => Store.markSkipped(id));
      buildInterstitial(I18N.tr(question.branch.interstitial, currentLang()), () => {
        goTo(Navigation.nextThemeStartIndex(currentIndex), { skipAnimation: false });
      });
      return;
    }
    goTo(Navigation.nextIndex(currentIndex));
  }

  renderScreen(currentIndex);
})();
