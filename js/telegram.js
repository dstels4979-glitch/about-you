/**
 * TELEGRAM DELIVERY
 * ------------------
 * Sends the finished quiz straight to a Telegram chat via the Bot API,
 * instead of showing the answers anywhere on the page.
 *
 * SETUP (do this before publishing the site):
 *   1. Open @BotFather in Telegram, send /newbot, follow the prompts.
 *      You'll get a token that looks like  123456789:AA...  — put it below.
 *   2. Find out the chat_id that should receive the results:
 *        - to receive them in your own DMs with the bot: send the bot any
 *          message, then open this URL in your browser (with your token):
 *            https://api.telegram.org/bot<TOKEN>/getUpdates
 *          and read the "chat":{"id": ...} value from the JSON response.
 *        - to receive them in a group: add the bot to the group, send a
 *          message there, then use the same getUpdates URL.
 *   3. Paste both values into TELEGRAM_CONFIG below.
 *
 * ⚠️ SECURITY NOTE: this is a static site with no backend, so the bot
 * token below is visible to anyone who views the page source. That's
 * fine for a private, personal quiz link that you don't publicly share,
 * but do NOT reuse a bot token that guards anything sensitive. Telegram
 * lets you revoke/regenerate a bot's token any time via @BotFather
 * (/revoke) if it ever leaks somewhere you didn't intend.
 */

const TELEGRAM_CONFIG = {
  botToken: "8611734104:AAEM3usT0RdBzHwuvZy45iTsfQhGpAH9MHQ",
  chatId: "8130212298",
};

const Telegram = (() => {
  const MAX_CHUNK = 3500; // stay safely under Telegram's 4096-char message limit

  function isConfigured() {
    return (
      TELEGRAM_CONFIG.botToken &&
      TELEGRAM_CONFIG.chatId &&
      !TELEGRAM_CONFIG.botToken.includes("PUT_YOUR") &&
      !TELEGRAM_CONFIG.chatId.includes("PUT_YOUR")
    );
  }

  // Reports are always written out in Russian regardless of which
  // language the respondent answered in, since that's the language of
  // whoever reads the results in Telegram. Free-typed answers are kept
  // exactly as the respondent wrote them (any language).
  const REPORT_LANG = "ru";

  function formatSingleValue(question, value) {
    const option = (question.options || []).find((o) => o.value === value);
    return option ? I18N.tr(option.label, REPORT_LANG) : String(value);
  }

  function formatAnswer(question, answer) {
    if (answer === undefined || answer === null || answer === "") return null;

    switch (question.type) {
      case "text":
      case "textarea":
        return String(answer).trim() || null;

      case "text-with-checkbox": {
        if (!answer.text || !answer.text.trim()) return null;
        const sugar = answer.checked ? ` (${I18N.tr(question.checkboxLabel, REPORT_LANG)})` : "";
        return answer.text.trim() + sugar;
      }

      case "single-choice":
      case "yesno-branch":
      case "cards":
        return formatSingleValue(question, answer);

      case "multi-choice": {
        if (!answer.selected || !answer.selected.length) return null;
        return answer.selected
          .map((value) => {
            const label = formatSingleValue(question, value);
            const sub = question.subOption && answer.sub && answer.sub[value] ? ` (${I18N.tr(question.subOption.label, REPORT_LANG)})` : "";
            return label + sub;
          })
          .join(", ");
      }

      default:
        return null;
    }
  }

  function buildReport() {
    const lines = ["💌 Новая анкета заполнена!", ""];

    THEMES.forEach((theme) => {
      const questionLines = [];
      theme.questions.forEach((question) => {
        if (Store.isSkipped(question.id)) return;
        const formatted = formatAnswer(question, Store.getAnswer(question.id));
        if (formatted) questionLines.push(`• ${I18N.tr(question.prompt, REPORT_LANG)}\n  ${formatted}`);
      });
      if (questionLines.length) {
        lines.push(`${theme.emoji} ${I18N.tr(theme.title, REPORT_LANG)}`);
        lines.push(...questionLines);
        lines.push("");
      }
    });

    const respondentLang = Store.getLang();
    if (respondentLang) {
      const langName = (I18N.LANGS.find((l) => l.code === respondentLang) || {}).name || respondentLang;
      lines.push(`🌐 Анкета пройдена на языке: ${langName}`);
    }

    return lines.join("\n").trim();
  }

  // Splits a long report into chunks that each fit in one Telegram message,
  // never cutting a line in half.
  function chunkText(text, maxLen) {
    const lines = text.split("\n");
    const chunks = [];
    let current = "";
    lines.forEach((line) => {
      const candidate = current ? current + "\n" + line : line;
      if (candidate.length > maxLen && current) {
        chunks.push(current);
        current = line;
      } else {
        current = candidate;
      }
    });
    if (current) chunks.push(current);
    return chunks;
  }

  async function sendMessage(text) {
    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CONFIG.chatId, text }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Telegram API error ${response.status}: ${body}`);
    }
  }

  async function send() {
    if (!isConfigured()) {
      throw new Error(
        "Telegram bot is not configured yet — set botToken/chatId in js/telegram.js"
      );
    }
    const report = buildReport();
    const chunks = chunkText(report, MAX_CHUNK);
    for (const chunk of chunks) {
      await sendMessage(chunk);
    }
  }

  return { send, buildReport, isConfigured };
})();
