/**
 * QUESTIONS RENDERER
 * ------------------
 * Given a question config object (see data.js) and a container element,
 * builds the right UI for its `type`, restores any previously saved
 * answer, and keeps the Store + "Next" button validity in sync.
 *
 * Every render function receives the same signature:
 *   render(question, container, { onValidityChange, onAnswered })
 * `onValidityChange(bool)` toggles whether "Далее" is enabled.
 * `onAnswered(value)` is called on every change, mainly so app.js can
 * react to yes/no branch answers immediately.
 *
 * LANGUAGE: the current interface language is read directly from
 * Store.getLang() (defaulting to "ru") — every label/placeholder that
 * comes from data.js is a {ru,uz,en} object and is resolved with
 * I18N.tr(obj, lang) right before it's shown.
 */

const Renderer = (() => {
  function lang() {
    return Store.getLang() || I18N.DEFAULT_LANG;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function showToast(message) {
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();
    const toast = el("div", "toast", message);
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("toast--visible"));
    setTimeout(() => {
      toast.classList.remove("toast--visible");
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // ---------- text ----------
  function renderText(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const input = el("input", "field-input");
    input.type = "text";
    input.placeholder = question.placeholder ? I18N.tr(question.placeholder, L) : I18N.t(L, "defaultTextPlaceholder");
    input.value = Store.getAnswer(question.id) || "";
    input.addEventListener("input", () => {
      Store.setAnswer(question.id, input.value);
      onAnswered(input.value);
    });
    container.appendChild(input);
    onValidityChange(true);
  }

  // ---------- textarea ----------
  function renderTextarea(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const textarea = el("textarea", "field-textarea");
    textarea.rows = 4;
    textarea.placeholder = question.placeholder ? I18N.tr(question.placeholder, L) : I18N.t(L, "defaultTextareaPlaceholder");
    textarea.value = Store.getAnswer(question.id) || "";
    textarea.addEventListener("input", () => {
      Store.setAnswer(question.id, textarea.value);
      onAnswered(textarea.value);
    });
    container.appendChild(textarea);
    onValidityChange(true);
  }

  // ---------- text-with-checkbox ----------
  function renderTextWithCheckbox(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const saved = Store.getAnswer(question.id) || { text: "", checked: false };
    const input = el("input", "field-input");
    input.type = "text";
    input.placeholder = question.placeholder ? I18N.tr(question.placeholder, L) : I18N.t(L, "defaultTextPlaceholder");
    input.value = saved.text;

    const label = el("label", "checkbox-row");
    const checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.checked = saved.checked;
    label.appendChild(checkbox);
    label.appendChild(el("span", null, I18N.tr(question.checkboxLabel, L)));

    function persist() {
      const value = { text: input.value, checked: checkbox.checked };
      Store.setAnswer(question.id, value);
      onAnswered(value);
    }

    input.addEventListener("input", persist);
    checkbox.addEventListener("change", persist);

    container.appendChild(input);
    container.appendChild(label);
    onValidityChange(true);
  }

  // ---------- single-choice / yesno-branch ----------
  function renderSingleChoice(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const wrap = el("div", "options-list");
    const saved = Store.getAnswer(question.id);

    question.options.forEach((option) => {
      const btn = el("button", "option-pill", I18N.tr(option.label, L));
      btn.type = "button";
      if (saved === option.value) btn.classList.add("option-pill--selected");
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".option-pill").forEach((b) => b.classList.remove("option-pill--selected"));
        btn.classList.add("option-pill--selected");
        Store.setAnswer(question.id, option.value);
        onValidityChange(true);
        onAnswered(option.value);
      });
      wrap.appendChild(btn);
    });

    container.appendChild(wrap);
    onValidityChange(!!saved);
  }

  // ---------- cards ----------
  function renderCards(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const wrap = el("div", "cards-grid");
    const saved = Store.getAnswer(question.id);

    question.options.forEach((opt) => {
      const card = el("button", "choice-card");
      card.type = "button";
      if (saved === opt.value) card.classList.add("choice-card--selected");

      const imgSlot = el("div", "choice-card__image");
      imgSlot.textContent = opt.emoji || "";
      // opt.image can be set later (e.g. "assets/theme-images/spring.jpg")
      if (opt.image) {
        imgSlot.style.backgroundImage = `url(${opt.image})`;
        imgSlot.textContent = "";
      }

      const labelSlot = el("div", "choice-card__label", I18N.tr(opt.label, L));
      card.appendChild(imgSlot);
      card.appendChild(labelSlot);

      card.addEventListener("click", () => {
        wrap.querySelectorAll(".choice-card").forEach((c) => c.classList.remove("choice-card--selected"));
        card.classList.add("choice-card--selected");
        Store.setAnswer(question.id, opt.value);
        onValidityChange(true);
        onAnswered(opt.value);
      });

      wrap.appendChild(card);
    });

    container.appendChild(wrap);
    onValidityChange(!!saved);
  }

  // ---------- multi-choice ----------
  function renderMultiChoice(question, container, { onValidityChange, onAnswered }) {
    const L = lang();
    const saved = Store.getAnswer(question.id) || { selected: [], sub: {}, custom: [] };
    const wrap = el("div", "options-list");

    function persist() {
      Store.setAnswer(question.id, saved);
      onAnswered(saved);
      onValidityChange(true); // multi-choice never blocks progress
    }

    // `option` is either a real {value,label} from data.js, or a synthetic
    // one built on the fly for a user-typed custom entry (label === value).
    function makeOptionChip(option) {
      const optionValue = option.value;
      const row = el("div", "multi-option-row");
      const chip = el("button", "option-pill", I18N.tr(option.label, L));
      chip.type = "button";
      const isSelected = () => saved.selected.includes(optionValue);
      if (isSelected()) chip.classList.add("option-pill--selected");

      let subCheckboxLabel = null;
      if (question.subOption) {
        subCheckboxLabel = el("label", "checkbox-row checkbox-row--sub");
        const cb = el("input");
        cb.type = "checkbox";
        cb.checked = !!saved.sub[optionValue];
        subCheckboxLabel.appendChild(cb);
        subCheckboxLabel.appendChild(el("span", null, I18N.tr(question.subOption.label, L)));
        subCheckboxLabel.style.display = isSelected() ? "flex" : "none";
        cb.addEventListener("change", () => {
          saved.sub[optionValue] = cb.checked;
          persist();
        });
      }

      chip.addEventListener("click", () => {
        const idx = saved.selected.indexOf(optionValue);
        if (idx >= 0) {
          saved.selected.splice(idx, 1);
          chip.classList.remove("option-pill--selected");
          if (subCheckboxLabel) subCheckboxLabel.style.display = "none";
        } else {
          if (question.maxSelect && saved.selected.length >= question.maxSelect) {
            showToast(I18N.tr(question.limitMessage, L) || `${question.maxSelect}`);
            return;
          }
          saved.selected.push(optionValue);
          chip.classList.add("option-pill--selected");
          if (subCheckboxLabel) subCheckboxLabel.style.display = "flex";
        }
        persist();
      });

      row.appendChild(chip);
      if (subCheckboxLabel) row.appendChild(subCheckboxLabel);
      return row;
    }

    question.options.forEach((option) => wrap.appendChild(makeOptionChip(option)));

    // previously added custom (free-typed) options — not present in question.options
    const knownValues = question.options.map((o) => o.value);
    saved.custom.forEach((customValue) => {
      if (!knownValues.includes(customValue)) {
        wrap.appendChild(makeOptionChip({ value: customValue, label: customValue }));
      }
    });

    container.appendChild(wrap);

    if (question.allowCustom) {
      const addBtn = el("button", "add-custom-btn", I18N.t(L, "addCustom"));
      addBtn.type = "button";
      const inputRow = el("div", "add-custom-row");
      inputRow.style.display = "none";
      const input = el("input", "field-input");
      input.type = "text";
      input.placeholder = I18N.t(L, "customPlaceholder");
      const confirmBtn = el("button", "add-custom-confirm", I18N.t(L, "addConfirm"));
      confirmBtn.type = "button";

      function commitCustom() {
        const value = input.value.trim();
        if (!value) return;
        saved.custom.push(value);
        saved.selected.push(value);
        wrap.appendChild(makeOptionChip({ value, label: value }));
        input.value = "";
        inputRow.style.display = "none";
        persist();
      }

      addBtn.addEventListener("click", () => {
        inputRow.style.display = "flex";
        input.focus();
      });
      confirmBtn.addEventListener("click", commitCustom);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") commitCustom();
      });

      inputRow.appendChild(input);
      inputRow.appendChild(confirmBtn);
      container.appendChild(addBtn);
      container.appendChild(inputRow);
    }

    onValidityChange(true);
  }

  const renderers = {
    text: renderText,
    textarea: renderTextarea,
    "text-with-checkbox": renderTextWithCheckbox,
    "single-choice": renderSingleChoice,
    "yesno-branch": renderSingleChoice,
    cards: renderCards,
    "multi-choice": renderMultiChoice,
  };

  function render(question, container, callbacks) {
    const fn = renderers[question.type];
    if (!fn) {
      console.error("Unknown question type:", question.type);
      return;
    }
    fn(question, container, callbacks);
  }

  return { render, showToast };
})();
