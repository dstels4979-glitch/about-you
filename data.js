/**
 * QUIZ CONFIGURATION
 * ------------------
 * This is the single source of truth for the whole quiz.
 * To add a new theme: push an object into THEMES with the same shape.
 * To add a new question to a theme: push an object into that theme's `questions` array.
 * The rendering engine (js/questions.js) and navigation engine (js/navigation.js)
 * read this file — you should not need to touch them when only content changes.
 *
 * Supported question `type` values:
 *   "textarea"        — free multi-line text, one open answer
 *   "text"             — free single-line text
 *   "single-choice"    — pick exactly one option (pill/button style)
 *   "cards"             — pick exactly one option, rendered as a big illustrated card
 *   "multi-choice"      — pick one or many options (checkboxes), supports:
 *         maxSelect       -> caps how many can be chosen, shows a toast if exceeded
 *         allowCustom     -> adds an "add your own" input
 *         subOption       -> { label } adds a small checkbox under each *selected* option
 *   "text-with-checkbox" — free text plus a single companion checkbox (e.g. "with sugar")
 *   "yesno-branch"       — Yes/No question that can alter the flow (see `branch`)
 *
 * `branch` (only on yesno-branch questions):
 *   { on: "Нет", interstitial: "Жаль 😔", skip: ["idOfNextQuestion", ...] }
 *   -> if the user picks the "on" value, show a short interstitial screen with the given
 *      text, then jump straight to the next theme, skipping the listed question ids.
 */

const THEMES = [
  {
    id: "flowers",
    emoji: "🌺",
    title: "Цветы",
    theme: {
      primary: "#c96b83",
      secondary: "#f4dfe4",
      accent: "#5e3245",
      bgFrom: "#fbeef1",
      bgTo: "#f0d3da",
    },
    backgroundImage: null, // put e.g. "assets/backgrounds/flowers.jpg" here later
    themeImage: null, // put e.g. "assets/theme-images/flowers.png" here later
    questions: [
      {
        id: "flower_types",
        type: "textarea",
        prompt: "Какие виды цветов тебе нравятся?",
        placeholder: "Пиши сколько угодно — перечисли всё, что любишь…",
      },
      {
        id: "flower_frequency",
        type: "single-choice",
        prompt: "Как часто тебе было бы приятно получать цветы?",
        options: ["Раз в месяц", "По праздникам", "Без повода"],
      },
    ],
  },

  {
    id: "food",
    emoji: "🍽️",
    title: "Еда и напитки",
    theme: {
      primary: "#c97b4a",
      secondary: "#ffe8cc",
      accent: "#4a2c1d",
      bgFrom: "#fff3e2",
      bgTo: "#f8ddb8",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      {
        id: "cuisine",
        type: "multi-choice",
        prompt: "Любимая кухня",
        options: [
          "Турецкая",
          "Узбекская",
          "Итальянская",
          "Французская",
          "Грузинская",
          "Греческая",
          "Морепродукты",
        ],
        allowCustom: true,
      },
      { id: "favorite_dish", type: "text", prompt: "Какое конкретное блюдо тебе нравится больше всего?" },
      { id: "favorite_restaurant", type: "text", prompt: "Любимый ресторан" },
      { id: "favorite_drink", type: "text", prompt: "Любимый напиток" },
      {
        id: "coffee",
        type: "multi-choice",
        prompt: "Любимый кофе",
        options: [
          "Эспрессо",
          "Американо",
          "Капучино",
          "Латте",
          "Флэт Уайт",
          "Раф",
          "Мокко",
          "Макиато",
          "Айс Латте",
          "Айс Американо",
          "Матча Латте",
        ],
        subOption: { label: "С сахаром" },
      },
      {
        id: "tea",
        type: "text-with-checkbox",
        prompt: "Любимый чай",
        checkboxLabel: "С сахаром",
      },
      { id: "soda", type: "textarea", prompt: "Любимая газировка", placeholder: "Можно перечислить несколько вариантов…" },
      { id: "desserts", type: "textarea", prompt: "Какие десерты ты любишь?" },
      { id: "chocolate", type: "textarea", prompt: "Какой шоколад тебе нравится?" },
      { id: "fruits", type: "textarea", prompt: "Какие фрукты ты любишь?" },
      { id: "berries", type: "textarea", prompt: "Какие ягоды тебе нравятся?" },
    ],
  },

  {
    id: "walks",
    emoji: "🚶",
    title: "Прогулки",
    theme: {
      primary: "#7a9b76",
      secondary: "#e4eedf",
      accent: "#2f4230",
      bgFrom: "#eef5ea",
      bgTo: "#d6e6cd",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      {
        id: "likes_walking",
        type: "yesno-branch",
        prompt: "Любишь ли ты долго гулять пешком?",
        options: ["Да", "Нет"],
        branch: {
          on: "Нет",
          interstitial: "Жаль 😔",
          skip: ["walking_hours"],
        },
      },
      {
        id: "walking_hours",
        type: "single-choice",
        prompt: "Сколько часов ты можешь гулять?",
        options: ["1 час", "2 часа", "3 часа", "Могу сколько угодно, главное — с любимым человеком ❤️"],
      },
    ],
  },

  {
    id: "preferences",
    emoji: "🎉",
    title: "Предпочтения",
    theme: {
      primary: "#8f7bb0",
      secondary: "#e9e1f3",
      accent: "#3c2f52",
      bgFrom: "#f2eef9",
      bgTo: "#ddd1ec",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      {
        id: "favorite_season",
        type: "cards",
        prompt: "Любимое время года",
        options: [
          { value: "Весна", emoji: "🌸" },
          { value: "Лето", emoji: "☀️" },
          { value: "Осень", emoji: "🍂" },
          { value: "Зима", emoji: "❄️" },
        ],
      },
      { id: "favorite_holiday", type: "text", prompt: "Любимый праздник" },
    ],
  },

  {
    id: "character",
    emoji: "😊",
    title: "Характер",
    theme: {
      primary: "#6e8fa3",
      secondary: "#dde8ee",
      accent: "#28394a",
      bgFrom: "#eaf2f6",
      bgTo: "#cfe0e9",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      { id: "makes_happy", type: "textarea", prompt: "Что тебя может очень сильно обрадовать?" },
      { id: "ruins_mood", type: "textarea", prompt: "Что может испортить настроение?" },
      { id: "annoys", type: "textarea", prompt: "Что тебя раздражает?" },
      { id: "makes_laugh", type: "textarea", prompt: "Что заставляет тебя смеяться?" },
      { id: "motivates", type: "textarea", prompt: "Что тебя мотивирует?" },
      { id: "calms", type: "textarea", prompt: "Что тебя успокаивает?" },
    ],
  },

  {
    id: "support",
    emoji: "🤍",
    title: "Поддержка",
    theme: {
      primary: "#a3879b",
      secondary: "#f0e6ec",
      accent: "#4a3346",
      bgFrom: "#f8f1f5",
      bgTo: "#e6d3e0",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      { id: "stress_signs", type: "textarea", prompt: "Как я могу понять, что ты испытываешь стресс, сильные переживания или тебе просто тяжело?" },
      { id: "how_to_help", type: "textarea", prompt: "Что я могу сделать, чтобы тебе стало легче?" },
      { id: "best_distraction", type: "textarea", prompt: "Как лучше всего отвлечь тебя от плохих мыслей?" },
      { id: "always_helps", type: "textarea", prompt: "Есть ли что-то, что тебя всегда успокаивает или помогает почувствовать себя лучше?" },
      { id: "what_not_to_do", type: "textarea", prompt: "Что мне точно не стоит делать или говорить в такие моменты?" },
      { id: "wants_to_be_alone", type: "textarea", prompt: "Если тебе захочется побыть одной, как мне понять, что это именно то, что тебе сейчас нужно?" },
      { id: "not_responding", type: "textarea", prompt: "Если ты не отвечаешь на сообщения из-за плохого настроения, как мне правильно поступить?" },
      { id: "supportive_words", type: "textarea", prompt: "Есть ли какие-то слова поддержки, которые тебе особенно приятно слышать?" },
      { id: "real_care", type: "textarea", prompt: "Что для тебя означает настоящая забота в такие моменты?" },
    ],
  },

  {
    id: "travel",
    emoji: "🌍",
    title: "Путешествия",
    theme: {
      primary: "#2c6e82",
      secondary: "#d6e9ee",
      accent: "#e07856",
      bgFrom: "#e5f2f5",
      bgTo: "#bfe0e8",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      { id: "dream_country", type: "textarea", prompt: "В какой стране ты мечтаешь побывать?", placeholder: "Можно перечислить несколько стран…" },
      {
        id: "sea_or_mountains",
        type: "cards",
        prompt: "Что ты выберешь?",
        options: [
          { value: "Море", emoji: "🌊" },
          { value: "Горы", emoji: "⛰️" },
        ],
      },
      {
        id: "hotel_or_tent",
        type: "cards",
        prompt: "Что тебе ближе?",
        options: [
          { value: "Отель", emoji: "🏨" },
          { value: "Палатка", emoji: "⛺" },
        ],
      },
      {
        id: "plane_or_train",
        type: "cards",
        prompt: "Что предпочитаешь?",
        options: [
          { value: "Самолет", emoji: "✈️" },
          { value: "Поезд", emoji: "🚆" },
        ],
      },
      {
        id: "long_trips",
        type: "single-choice",
        prompt: "Любишь ли долгие поездки?",
        options: ["Да", "Нет"],
      },
    ],
  },

  {
    id: "gifts",
    emoji: "🎁",
    title: "Подарки",
    theme: {
      primary: "#8b3a4a",
      secondary: "#f1dde1",
      accent: "#3a1720",
      bgFrom: "#f8e9ec",
      bgTo: "#e6c3cb",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      { id: "likes_gifts", type: "textarea", prompt: "Какие подарки тебе нравятся?" },
      { id: "dislikes_gifts", type: "textarea", prompt: "Какие подарки тебе точно не нравятся?" },
    ],
  },

  {
    id: "relationships",
    emoji: "❤️",
    title: "Отношения",
    theme: {
      primary: "#7a2e3a",
      secondary: "#ecd7da",
      accent: "#2a0f14",
      bgFrom: "#f6e6e8",
      bgTo: "#dcb3ba",
    },
    backgroundImage: null,
    themeImage: null,
    questions: [
      {
        id: "love_language",
        type: "multi-choice",
        prompt: "Какой язык любви тебе ближе?",
        options: [
          "💬 Слова поддержки",
          "🕒 Время вместе",
          "🎁 Подарки",
          "🤝 Помощь",
          "🤍 Прикосновения",
        ],
        maxSelect: 3,
        limitMessage: "Можно выбрать не более трех вариантов ❤️",
      },
      { id: "most_important", type: "textarea", prompt: "Что для тебя самое важное в отношениях?" },
      { id: "never_do", type: "textarea", prompt: "Что никогда нельзя делать в отношениях?" },
      { id: "ideal_date", type: "textarea", prompt: "Каким ты представляешь идеальное свидание?" },
      { id: "attractive", type: "textarea", prompt: "Что делает человека привлекательным для тебя?" },
    ],
  },
];

const WELCOME_SCREEN = {
  title: "Привет 👋",
  text: "Это небольшая анкета, которая поможет мне узнать тебя ещё лучше. Здесь нет правильных или неправильных ответов — просто будь собой.",
  cta: "Начать",
};

const FINAL_SCREEN = {
  title: "Спасибо ❤️",
  text: "Мне очень приятно, что ты уделила время и прошла эту небольшую анкету. Теперь я знаю тебя немного лучше. Спасибо за твою искренность и доверие. 😊",
  cta: "✨ Завершить",
};
