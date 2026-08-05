/**
 * QUIZ CONFIGURATION
 * ------------------
 * This is the single source of truth for the whole quiz.
 * To add a new theme: push an object into THEMES with the same shape.
 * To add a new question to a theme: push an object into that theme's `questions` array.
 * The rendering engine (js/questions.js) and navigation engine (js/navigation.js)
 * read this file — you should not need to touch them when only content changes.
 *
 * MULTI-LANGUAGE: every piece of text a user reads is written as
 *   { ru: "...", uz: "...", en: "..." }
 * and read with I18N.tr(obj, lang) (see js/i18n.js). To add a 4th language,
 * add its key to every one of these objects (and to js/i18n.js).
 *
 * Every selectable option (single-choice / cards / multi-choice) has a
 * stable `value` (never shown to the user, never translated — this is
 * what actually gets stored as the answer) and a `label` translation
 * object (what the user sees). Keeping `value` stable means switching
 * the interface language mid-quiz never loses or reshuffles an answer.
 *
 * BACKGROUND IMAGES: the whole screen behind the glass card can show a
 * full-page photo (js/app.js crossfades smoothly between them as the
 * user moves through the quiz). Three levels, checked in this order:
 *   1. question.backgroundImage   — this exact question only
 *   2. theme.backgroundImage      — every question of that theme that
 *                                   doesn't set its own (1)
 *   3. (none set)                 — falls back to the plain colour
 *                                   gradient using that theme's palette
 * WELCOME_SCREEN.backgroundImage / FINAL_SCREEN.backgroundImage work the
 * same way for the language/welcome and thank-you screens. Just fill in
 * a path (e.g. "assets/backgrounds/coffee.jpg") — nothing else to wire up.
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
 *   { on: "no", interstitial: {ru,uz,en}, skip: ["idOfNextQuestion", ...] }
 *   -> if the user picks the option whose value equals `on`, show a short
 *      interstitial screen with the given text, then jump straight to the
 *      next theme, skipping the listed question ids.
 */

const THEMES = [
  {
    id: "flowers",
    emoji: "🌺",
    title: { ru: "Цветы", uz: "Gullar", en: "Flowers" },
    theme: {
      primary: "#c96b83",
      secondary: "#f4dfe4",
      accent: "#5e3245",
      bgFrom: "#fbeef1",
      bgTo: "#f0d3da",
    },
    backgroundImage: "images/flawers.jpg", // put e.g. "assets/backgrounds/flowers.jpg" here later
    themeImage: "images/flowers.jpg", // put e.g. "assets/theme-images/flowers.png" here later
    questions: [
      {
        id: "flower_types",
        type: "textarea",
        prompt: { ru: "Какие виды цветов тебе нравятся?", uz: "Qanday gul turlari senga yoqadi?", en: "What kinds of flowers do you like?" },
        placeholder: {
          ru: "Пиши сколько угодно — перечисли всё, что любишь…",
          uz: "Xohlagancha yoz — yoqtirgan hammasini sanab o't…",
          en: "Write as much as you want — list everything you love…",
        },
      },
      {
        id: "flower_frequency",
        type: "single-choice",
        prompt: {
          ru: "Как часто тебе было бы приятно получать цветы?",
          uz: "Senga qanchalik tez-tez gul olib berish yoqadi?",
          en: "How often would you enjoy receiving flowers?",
        },
        options: [
          { value: "monthly", label: { ru: "Раз в месяц", uz: "Oyiga bir marta", en: "Once a month" } },
          { value: "holidays", label: { ru: "По праздникам", uz: "Bayramlarda", en: "On holidays" } },
          { value: "no_reason", label: { ru: "Без повода", uz: "Sababsiz ham", en: "Just because" } },
        ],
      },
    ],
  },

  {
    id: "food",
    emoji: "🍽️",
    title: { ru: "Еда и напитки", uz: "Ovqat va ichimliklar", en: "Food & Drinks" },
    theme: {
      primary: "#c97b4a",
      secondary: "#ffe8cc",
      accent: "#4a2c1d",
      bgFrom: "#fff3e2",
      bgTo: "#f8ddb8",
    },
    backgroundImage: "images/eda.jpg",
    themeImage: null,
    questions: [
      {
        id: "cuisine",
        type: "multi-choice",
        prompt: { ru: "Любимая кухня", uz: "Sevimli oshxona", en: "Favorite cuisine" },
        options: [
          { value: "turkish", label: { ru: "Турецкая", uz: "Turk oshxonasi", en: "Turkish" } },
          { value: "uzbek", label: { ru: "Узбекская", uz: "O'zbek oshxonasi", en: "Uzbek" } },
          { value: "italian", label: { ru: "Итальянская", uz: "Italyan oshxonasi", en: "Italian" } },
          { value: "french", label: { ru: "Французская", uz: "Fransuz oshxonasi", en: "French" } },
          { value: "georgian", label: { ru: "Грузинская", uz: "Gruzin oshxonasi", en: "Georgian" } },
          { value: "greek", label: { ru: "Греческая", uz: "Grek oshxonasi", en: "Greek" } },
          { value: "seafood", label: { ru: "Морепродукты", uz: "Dengiz mahsulotlari", en: "Seafood" } },
        ],
        allowCustom: true,
      },
      {
        id: "favorite_dish",
        type: "text",
        prompt: { ru: "Какое конкретное блюдо тебе нравится больше всего?", uz: "Qaysi taom senga eng ko'p yoqadi?", en: "Which specific dish do you like the most?" },
      },
      { id: "favorite_restaurant", type: "text", prompt: { ru: "Любимый ресторан", uz: "Sevimli restoran", en: "Favorite restaurant" } },
      { id: "favorite_drink", type: "text", prompt: { ru: "Любимый напиток", uz: "Sevimli ichimlik", en: "Favorite drink" } },
      {
        id: "coffee",
        type: "multi-choice",
        prompt: { ru: "Любимый кофе", uz: "Sevimli qahva", en: "Favorite coffee" },
        // own background from here on — overrides the theme's "food" background
        // put e.g. "assets/backgrounds/coffee.jpg" here
        backgroundImage: null,
        options: [
          { value: "espresso", label: { ru: "Эспрессо", uz: "Espresso", en: "Espresso" } },
          { value: "americano", label: { ru: "Американо", uz: "Amerikano", en: "Americano" } },
          { value: "cappuccino", label: { ru: "Капучино", uz: "Kapuchino", en: "Cappuccino" } },
          { value: "latte", label: { ru: "Латте", uz: "Latte", en: "Latte" } },
          { value: "flat_white", label: { ru: "Флэт Уайт", uz: "Flet Vayt", en: "Flat White" } },
          { value: "raf", label: { ru: "Раф", uz: "Raf", en: "Raf" } },
          { value: "mocha", label: { ru: "Мокко", uz: "Mokko", en: "Mocha" } },
          { value: "macchiato", label: { ru: "Макиато", uz: "Makiato", en: "Macchiato" } },
          { value: "iced_latte", label: { ru: "Айс Латте", uz: "Ayс Latte", en: "Iced Latte" } },
          { value: "iced_americano", label: { ru: "Айс Американо", uz: "Ayс Amerikano", en: "Iced Americano" } },
          { value: "matcha_latte", label: { ru: "Матча Латте", uz: "Matcha Latte", en: "Matcha Latte" } },
        ],
        subOption: { label: { ru: "С сахаром", uz: "Shakar bilan", en: "With sugar" } },
      },
      {
        id: "tea",
        type: "text-with-checkbox",
        prompt: { ru: "Любимый чай", uz: "Sevimli choy", en: "Favorite tea" },
        checkboxLabel: { ru: "С сахаром", uz: "Shakar bilan", en: "With sugar" },
        backgroundImage: null, // e.g. "assets/backgrounds/tea.jpg"
      },
      {
        id: "soda",
        type: "textarea",
        prompt: { ru: "Любимая газировка", uz: "Sevimli gazlangan ichimlik", en: "Favorite soda" },
        placeholder: {
          ru: "Можно перечислить несколько вариантов…",
          uz: "Bir nechta variantni sanab o'tishing mumkin…",
          en: "You can list several options…",
        },
        backgroundImage: null, // e.g. "assets/backgrounds/soda.jpg"
      },
      {
        id: "desserts",
        type: "textarea",
        prompt: { ru: "Какие десерты ты любишь?", uz: "Qanday desertlarni yoqtirasan?", en: "What desserts do you like?" },
        backgroundImage: null, // e.g. "assets/backgrounds/desserts.jpg"
      },
      {
        id: "chocolate",
        type: "textarea",
        prompt: { ru: "Какой шоколад тебе нравится?", uz: "Qanday shokolad senga yoqadi?", en: "What chocolate do you like?" },
        backgroundImage: null, // e.g. "assets/backgrounds/chocolate.jpg"
      },
      {
        id: "fruits",
        type: "textarea",
        prompt: { ru: "Какие фрукты ты любишь?", uz: "Qanday mevalarni yoqtirasan?", en: "What fruits do you like?" },
        backgroundImage: null, // e.g. "assets/backgrounds/fruits.jpg"
      },
      {
        id: "berries",
        type: "textarea",
        prompt: { ru: "Какие ягоды тебе нравятся?", uz: "Qanday rezavorlar senga yoqadi?", en: "What berries do you like?" },
        backgroundImage: null, // e.g. "assets/backgrounds/berries.jpg"
      },
    ],
  },

  {
    id: "walks",
    emoji: "🚶",
    title: { ru: "Прогулки", uz: "Sayr", en: "Walks" },
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
        prompt: { ru: "Любишь ли ты долго гулять пешком?", uz: "Uzoq vaqt piyoda sayr qilishni yoqtirasanmi?", en: "Do you enjoy long walks?" },
        options: [
          { value: "yes", label: { ru: "Да", uz: "Ha", en: "Yes" } },
          { value: "no", label: { ru: "Нет", uz: "Yo'q", en: "No" } },
        ],
        branch: {
          on: "no",
          interstitial: { ru: "Жаль 😔", uz: "Afsuski 😔", en: "Too bad 😔" },
          skip: ["walking_hours"],
        },
      },
      {
        id: "walking_hours",
        type: "single-choice",
        prompt: { ru: "Сколько часов ты можешь гулять?", uz: "Necha soat sayr qila olasan?", en: "How many hours can you walk?" },
        options: [
          { value: "1h", label: { ru: "1 час", uz: "1 soat", en: "1 hour" } },
          { value: "2h", label: { ru: "2 часа", uz: "2 soat", en: "2 hours" } },
          { value: "3h", label: { ru: "3 часа", uz: "3 soat", en: "3 hours" } },
          {
            value: "unlimited",
            label: {
              ru: "Могу сколько угодно, главное — с любимым человеком ❤️",
              uz: "Xohlagancha, faqat sevgan odamim bilan bo'lsa bo'ldi ❤️",
              en: "As long as it takes, as long as it's with the one I love ❤️",
            },
          },
        ],
      },
    ],
  },

  {
    id: "preferences",
    emoji: "🎉",
    title: { ru: "Предпочтения", uz: "Afzalliklar", en: "Preferences" },
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
        prompt: { ru: "Любимое время года", uz: "Sevimli fasl", en: "Favorite season" },
        options: [
          { value: "spring", emoji: "🌸", label: { ru: "Весна", uz: "Bahor", en: "Spring" } },
          { value: "summer", emoji: "☀️", label: { ru: "Лето", uz: "Yoz", en: "Summer" } },
          { value: "autumn", emoji: "🍂", label: { ru: "Осень", uz: "Kuz", en: "Autumn" } },
          { value: "winter", emoji: "❄️", label: { ru: "Зима", uz: "Qish", en: "Winter" } },
        ],
      },
      { id: "favorite_holiday", type: "text", prompt: { ru: "Любимый праздник", uz: "Sevimli bayram", en: "Favorite holiday" } },
    ],
  },

  {
    id: "character",
    emoji: "😊",
    title: { ru: "Характер", uz: "Xarakter", en: "Character" },
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
      { id: "makes_happy", type: "textarea", prompt: { ru: "Что тебя может очень сильно обрадовать?", uz: "Seni nima juda xursand qila oladi?", en: "What can make you really happy?" } },
      { id: "ruins_mood", type: "textarea", prompt: { ru: "Что может испортить настроение?", uz: "Nima kayfiyatingni buzishi mumkin?", en: "What can ruin your mood?" } },
      { id: "annoys", type: "textarea", prompt: { ru: "Что тебя раздражает?", uz: "Seni nima jahling chiqaradi?", en: "What annoys you?" } },
      { id: "makes_laugh", type: "textarea", prompt: { ru: "Что заставляет тебя смеяться?", uz: "Seni nima kuldiradi?", en: "What makes you laugh?" } },
      { id: "motivates", type: "textarea", prompt: { ru: "Что тебя мотивирует?", uz: "Seni nima ilhomlantiradi?", en: "What motivates you?" } },
      { id: "calms", type: "textarea", prompt: { ru: "Что тебя успокаивает?", uz: "Seni nima tinchlantiradi?", en: "What calms you down?" } },
    ],
  },

  {
    id: "support",
    emoji: "🤍",
    title: { ru: "Поддержка", uz: "Qo'llab-quvvatlash", en: "Support" },
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
      {
        id: "stress_signs",
        type: "textarea",
        prompt: {
          ru: "Как я могу понять, что ты испытываешь стресс, сильные переживания или тебе просто тяжело?",
          uz: "Sen stress, kuchli hissiyot kechirayotganingni yoki senga shunchaki qiyin ekanini qanday bilib olsam bo'ladi?",
          en: "How can I tell when you're stressed, overwhelmed, or just having a hard time?",
        },
      },
      {
        id: "how_to_help",
        type: "textarea",
        prompt: { ru: "Что я могу сделать, чтобы тебе стало легче?", uz: "Senga yengilroq bo'lishi uchun men nima qila olaman?", en: "What can I do to make things easier for you?" },
      },
      {
        id: "best_distraction",
        type: "textarea",
        prompt: { ru: "Как лучше всего отвлечь тебя от плохих мыслей?", uz: "Yomon fikrlardan chalg'itishning eng yaxshi yo'li qanday?", en: "What's the best way to distract you from bad thoughts?" },
      },
      {
        id: "always_helps",
        type: "textarea",
        prompt: {
          ru: "Есть ли что-то, что тебя всегда успокаивает или помогает почувствовать себя лучше?",
          uz: "Seni doim tinchlantiradigan yoki o'zingni yaxshi his qilishga yordam beradigan narsa bormi?",
          en: "Is there something that always calms you or helps you feel better?",
        },
      },
      {
        id: "what_not_to_do",
        type: "textarea",
        prompt: {
          ru: "Что мне точно не стоит делать или говорить в такие моменты?",
          uz: "Bunday paytlarda men aniq nima qilmasligim yoki aytmasligim kerak?",
          en: "What should I definitely avoid doing or saying in those moments?",
        },
      },
      {
        id: "wants_to_be_alone",
        type: "textarea",
        prompt: {
          ru: "Если тебе захочется побыть одной, как мне понять, что это именно то, что тебе сейчас нужно?",
          uz: "Agar yolg'iz qolgingiz kelsa, bu senga aynan hozir kerak bo'lgan narsa ekanini men qanday tushunaman?",
          en: "If you want to be alone, how will I know that's really what you need right now?",
        },
      },
      {
        id: "not_responding",
        type: "textarea",
        prompt: {
          ru: "Если ты не отвечаешь на сообщения из-за плохого настроения, как мне правильно поступить?",
          uz: "Agar yomon kayfiyat tufayli xabarlarga javob bermasang, men qanday harakat qilishim to'g'ri bo'ladi?",
          en: "If you're not replying to messages because of a bad mood, what's the right thing for me to do?",
        },
      },
      {
        id: "supportive_words",
        type: "textarea",
        prompt: {
          ru: "Есть ли какие-то слова поддержки, которые тебе особенно приятно слышать?",
          uz: "Senga eshitish alohida yoqadigan qo'llab-quvvatlovchi so'zlar bormi?",
          en: "Are there any supportive words you especially love to hear?",
        },
      },
      {
        id: "real_care",
        type: "textarea",
        prompt: { ru: "Что для тебя означает настоящая забота в такие моменты?", uz: "Bunday paytlarda haqiqiy g'amxo'rlik sen uchun nimani anglatadi?", en: "What does real care look like to you in those moments?" },
      },
    ],
  },

  {
    id: "travel",
    emoji: "🌍",
    title: { ru: "Путешествия", uz: "Sayohat", en: "Travel" },
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
      {
        id: "dream_country",
        type: "textarea",
        prompt: { ru: "В какой стране ты мечтаешь побывать?", uz: "Qaysi davlatda bo'lishni orzu qilasan?", en: "Which country do you dream of visiting?" },
        placeholder: {
          ru: "Можно перечислить несколько стран…",
          uz: "Bir nechta davlatni sanab o'tishing mumkin…",
          en: "You can list several countries…",
        },
      },
      {
        id: "sea_or_mountains",
        type: "cards",
        prompt: { ru: "Что ты выберешь?", uz: "Nimani tanlaysan?", en: "What would you choose?" },
        options: [
          { value: "sea", emoji: "🌊", label: { ru: "Море", uz: "Dengiz", en: "Sea" } },
          { value: "mountains", emoji: "⛰️", label: { ru: "Горы", uz: "Tog'lar", en: "Mountains" } },
        ],
      },
      {
        id: "hotel_or_tent",
        type: "cards",
        prompt: { ru: "Что тебе ближе?", uz: "Senga nima yaqinroq?", en: "What suits you more?" },
        options: [
          { value: "hotel", emoji: "🏨", label: { ru: "Отель", uz: "Mehmonxona", en: "Hotel" } },
          { value: "tent", emoji: "⛺", label: { ru: "Палатка", uz: "Chodir", en: "Tent" } },
        ],
      },
      {
        id: "plane_or_train",
        type: "cards",
        prompt: { ru: "Что предпочитаешь?", uz: "Nimani afzal ko'rasan?", en: "What do you prefer?" },
        options: [
          { value: "plane", emoji: "✈️", label: { ru: "Самолет", uz: "Samolyot", en: "Plane" } },
          { value: "train", emoji: "🚆", label: { ru: "Поезд", uz: "Poyezd", en: "Train" } },
        ],
      },
      {
        id: "long_trips",
        type: "single-choice",
        prompt: { ru: "Любишь ли долгие поездки?", uz: "Uzoq safarlarni yoqtirasanmi?", en: "Do you enjoy long trips?" },
        options: [
          { value: "yes", label: { ru: "Да", uz: "Ha", en: "Yes" } },
          { value: "no", label: { ru: "Нет", uz: "Yo'q", en: "No" } },
        ],
      },
    ],
  },

  {
    id: "gifts",
    emoji: "🎁",
    title: { ru: "Подарки", uz: "Sovg'alar", en: "Gifts" },
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
      { id: "likes_gifts", type: "textarea", prompt: { ru: "Какие подарки тебе нравятся?", uz: "Qanday sovg'alar senga yoqadi?", en: "What kind of gifts do you like?" } },
      { id: "dislikes_gifts", type: "textarea", prompt: { ru: "Какие подарки тебе точно не нравятся?", uz: "Qanday sovg'alar senga umuman yoqmaydi?", en: "What kind of gifts do you definitely not like?" } },
    ],
  },

  {
    id: "relationships",
    emoji: "❤️",
    title: { ru: "Отношения", uz: "Munosabatlar", en: "Relationships" },
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
        prompt: { ru: "Какой язык любви тебе ближе?", uz: "Qaysi sevgi tili senga yaqinroq?", en: "Which love languages resonate with you most?" },
        options: [
          { value: "words", label: { ru: "💬 Слова поддержки", uz: "💬 Qo'llab-quvvatlovchi so'zlar", en: "💬 Words of affirmation" } },
          { value: "time", label: { ru: "🕒 Время вместе", uz: "🕒 Birga o'tkazilgan vaqt", en: "🕒 Quality time" } },
          { value: "gifts", label: { ru: "🎁 Подарки", uz: "🎁 Sovg'alar", en: "🎁 Gifts" } },
          { value: "help", label: { ru: "🤝 Помощь", uz: "🤝 Yordam", en: "🤝 Acts of service" } },
          { value: "touch", label: { ru: "🤍 Прикосновения", uz: "🤍 Teginish", en: "🤍 Physical touch" } },
        ],
        maxSelect: 3,
        limitMessage: {
          ru: "Можно выбрать не более трех вариантов ❤️",
          uz: "Uchtadan ortiq variant tanlab bo'lmaydi ❤️",
          en: "You can select up to three options ❤️",
        },
      },
      { id: "most_important", type: "textarea", prompt: { ru: "Что для тебя самое важное в отношениях?", uz: "Munosabatlarda sen uchun eng muhimi nima?", en: "What matters most to you in a relationship?" } },
      { id: "never_do", type: "textarea", prompt: { ru: "Что никогда нельзя делать в отношениях?", uz: "Munosabatlarda hech qachon qilib bo'lmaydigan narsa nima?", en: "What should never be done in a relationship?" } },
      { id: "ideal_date", type: "textarea", prompt: { ru: "Каким ты представляешь идеальное свидание?", uz: "Ideal uchrashuvni qanday tasavvur qilasan?", en: "What does your ideal date look like?" } },
      { id: "attractive", type: "textarea", prompt: { ru: "Что делает человека привлекательным для тебя?", uz: "Sen uchun insonni jozibali qiladigan narsa nima?", en: "What makes a person attractive to you?" } },
    ],
  },
];

const WELCOME_SCREEN = {
  title: { ru: "Привет 👋", uz: "Salom 👋", en: "Hi 👋" },
  text: {
    ru: "Это небольшая анкета, которая поможет мне узнать тебя ещё лучше. Здесь нет правильных или неправильных ответов — просто будь собой.",
    uz: "Bu meni seni yanada yaxshiroq bilishimga yordam beradigan kichik anketa. Bu yerda to'g'ri yoki noto'g'ri javoblar yo'q — shunchaki o'zing bo'l.",
    en: "This is a little quiz to help me get to know you even better. There are no right or wrong answers here — just be yourself.",
  },
  cta: { ru: "Начать", uz: "Boshlash", en: "Start" },
  backgroundImage: "images/backgroundImage.jpg" , // shown behind the language-choice AND welcome screens; e.g. "assets/backgrounds/welcome.jpg"
};

const FINAL_SCREEN = {
  title: { ru: "Спасибо ❤️", uz: "Rahmat ❤️", en: "Thank you ❤️" },
  text: {
    ru: "Мне очень приятно, что ты уделила время и прошла эту небольшую анкету. Теперь я знаю тебя немного лучше. Спасибо за твою искренность и доверие. 😊",
    uz: "Vaqt ajratib, ushbu kichik anketani to'ldirganing men uchun juda yoqimli. Endi men seni biroz yaxshiroq bilaman. Samimiyligingiz va ishonchingiz uchun rahmat. 😊",
    en: "It means a lot that you took the time to go through this little quiz. Now I know you a bit better. Thank you for your honesty and trust. 😊",
  },
  cta: { ru: "✨ Завершить", uz: "✨ Yakunlash", en: "✨ Finish" },
  backgroundImage: null, // e.g. "assets/backgrounds/final.jpg"
};
