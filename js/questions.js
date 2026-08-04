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
 */

const Renderer = (() => {
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
    const input = el("input", "field-input");
    input.type = "text";
    input.placeholder = question.placeholder || "Твой ответ…";
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
    const textarea = el("textarea", "field-textarea");
    textarea.rows = 4;
    textarea.placeholder = question.placeholder || "Пиши сколько угодно…";
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
    const saved = Store.getAnswer(question.id) || { text: "", checked: false };
    const input = el("input", "field-input");
    input.type = "text";
    input.placeholder = question.placeholder || "Твой ответ…";
    input.value = saved.text;

    const label = el("label", "checkbox-row");
    const checkbox = el("input");
    checkbox.type = "checkbox";
    checkbox.checked = saved.checked;
    label.appendChild(checkbox);
    label.appendChild(el("span", null, question.checkboxLabel));

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
    const wrap = el("div", "options-list");
    const saved = Store.getAnswer(question.id);

    question.options.forEach((optionValue) => {
      const btn = el("button", "option-pill", optionValue);
      btn.type = "button";
      if (saved === optionValue) btn.classList.add("option-pill--selected");
      btn.addEventListener("click", () => {
        wrap.querySelectorAll(".option-pill").forEach((b) => b.classList.remove("option-pill--selected"));
        btn.classList.add("option-pill--selected");
        Store.setAnswer(question.id, optionValue);
        onValidityChange(true);
        onAnswered(optionValue);
      });
      wrap.appendChild(btn);
    });

    container.appendChild(wrap);
    onValidityChange(!!saved);
  }

  // ---------- cards ----------
  function renderCards(question, container, { onValidityChange, onAnswered }) {
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

      const labelSlot = el("div", "choice-card__label", opt.value);
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
    const saved = Store.getAnswer(question.id) || { selected: [], sub: {}, custom: [] };
    const wrap = el("div", "options-list");

    function persist() {
      Store.setAnswer(question.id, saved);
      onAnswered(saved);
      onValidityChange(true); // multi-choice never blocks progress
    }

    function makeOptionChip(optionValue) {
      const row = el("div", "multi-option-row");
      const chip = el("button", "option-pill", optionValue);
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
        subCheckboxLabel.appendChild(el("span", null, question.subOption.label));
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
            showToast(question.limitMessage || `Можно выбрать не более ${question.maxSelect} вариантов`);
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

    question.options.forEach((optionValue) => wrap.appendChild(makeOptionChip(optionValue)));

    // previously added custom options
    saved.custom.forEach((customValue) => {
      if (!question.options.includes(customValue)) wrap.appendChild(makeOptionChip(customValue));
    });

    container.appendChild(wrap);

    if (question.allowCustom) {
      const addBtn = el("button", "add-custom-btn", "+ Добавить свой вариант");
      addBtn.type = "button";
      const inputRow = el("div", "add-custom-row");
      inputRow.style.display = "none";
      const input = el("input", "field-input");
      input.type = "text";
      input.placeholder = "Свой вариант…";
      const confirmBtn = el("button", "add-custom-confirm", "Добавить");
      confirmBtn.type = "button";

      function commitCustom() {
        const value = input.value.trim();
        if (!value) return;
        saved.custom.push(value);
        saved.selected.push(value);
        wrap.appendChild(makeOptionChip(value));
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
