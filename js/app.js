/**
 * APP
 * ---
 * Wires Store + Navigation + Renderer together: draws whichever screen is
 * current, animates between screens, applies the active theme's palette,
 * and drives the progress indicator.
 */

(function () {
  const root = document.getElementById("screen-root");
  const progressFill = document.getElementById("progress-bar-fill");
  const progressText = document.getElementById("progress-text");
  const progressWrap = document.getElementById("progress-wrap");

  Store.load();
  let currentIndex = clampToValidScreen(Store.getScreenIndex());

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

  function updateProgress(index) {
    const progress = Navigation.progressFor(index);
    if (!progress) {
      progressWrap.classList.add("progress-wrap--hidden");
      return;
    }
    progressWrap.classList.remove("progress-wrap--hidden");
    const pct = Math.round((progress.step / progress.total) * 100);
    progressFill.style.width = pct + "%";
    progressText.textContent = `Шаг ${progress.step} из ${progress.total} · ${pct}% завершено`;
  }

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

  function renderScreen(index) {
    root.innerHTML = "";
    const screen = Navigation.getScreen(index);

    if (screen.kind === "welcome") {
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

  function buildWelcomeScreen() {
    const screen = el("section", "screen screen--welcome");
    screen.appendChild(el("h1", "welcome-title", WELCOME_SCREEN.title));
    screen.appendChild(el("p", "welcome-text", WELCOME_SCREEN.text));
    const startBtn = el("button", "cta-button", WELCOME_SCREEN.cta);
    startBtn.type = "button";
    startBtn.addEventListener("click", () => goTo(Navigation.nextIndex(0)));
    screen.appendChild(startBtn);
    return screen;
  }

  function buildFinalScreen() {
    const screen = el("section", "screen screen--final");
    screen.appendChild(el("h1", "final-title", FINAL_SCREEN.title));
    screen.appendChild(el("p", "final-text", FINAL_SCREEN.text));
    const doneBtn = el("button", "cta-button", FINAL_SCREEN.cta);
    doneBtn.type = "button";
    doneBtn.addEventListener("click", () => {
      doneBtn.disabled = true;
      doneBtn.textContent = "Готово ✨";
    });
    screen.appendChild(doneBtn);
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
    const { theme, question } = screen;
    const wrapper = el("section", "screen screen--question");

    if (screen.isFirstOfTheme) {
      const header = el("div", "theme-header");
      const emoji = el("div", "theme-header__emoji", theme.emoji);
      const title = el("h2", "theme-header__title", theme.title);
      header.appendChild(emoji);
      header.appendChild(title);
      if (theme.themeImage) {
        const img = el("div", "theme-header__image");
        img.style.backgroundImage = `url(${theme.themeImage})`;
        header.appendChild(img);
      }
      wrapper.appendChild(header);
    }

    wrapper.appendChild(el("h3", "question-prompt", question.prompt));

    const fieldWrap = el("div", "question-field");
    wrapper.appendChild(fieldWrap);

    const nav = el("div", "screen-nav");
    const backBtn = el("button", "nav-button nav-button--back", "Назад");
    backBtn.type = "button";
    const nextBtn = el("button", "nav-button nav-button--next", "Далее");
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
      buildInterstitial(question.branch.interstitial, () => {
        goTo(Navigation.nextThemeStartIndex(currentIndex), { skipAnimation: false });
      });
      return;
    }
    goTo(Navigation.nextIndex(currentIndex));
  }

  renderScreen(currentIndex);
})();
