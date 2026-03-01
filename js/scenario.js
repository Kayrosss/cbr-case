// ============================================
// НАСТРОЙКИ ЗВУКА И ГОЛОСА
// ============================================
const soundLevels = {
  bgMusic: 0.12,
  button: 0.4,
  bell: 0.5,
  cash: 0.5,
  noise: 0.3,
  ovation: 0.3,
  slider: 0.3,
  news: 0.3,
  victory: 0.5,
  default: 0.5
};

let soundEnabled = true;
let musicEnabled = true;
let voiceEnabled = true;
let volume = 50;
let audioInitialized = false;
let currentVoice = null;
let hasGreeted = false;

let eventsThisGame = 0;
const targetEvents = 3;        // желаемое количество событий за игру
const minTurnsBetweenEvents = 2; // минимум ходов между событиями
let lastEventTurn = -10;
let eventProbability = 0.1;    // начальная вероятность (для способа 3)

document.body.addEventListener('click', function initAudio() {
  if (!audioInitialized) {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctx.resume();
    audioInitialized = true;
    if (musicEnabled) {
      const music = document.getElementById('bgMusic');
      music.volume = volume / 100 * soundLevels.bgMusic;
      music.play().catch(e => {});
    }
    document.body.removeEventListener('click', initAudio);
  }
}, { once: true });

function playSound(soundId, type = 'default') {
  if (!soundEnabled) return;
  const sound = document.getElementById(soundId);
  if (sound) {
    sound.currentTime = 0;
    const level = soundLevels[type] || soundLevels.default;
    sound.volume = volume / 100 * level;
    sound.play().catch(e => {});
  }
}

function playVoice(phraseNumber) {
  if (!voiceEnabled) return;
  if (currentVoice) {
    currentVoice.pause();
    currentVoice.currentTime = 0;
  }
  currentVoice = new Audio(`assets/sounds/voice/voice${phraseNumber}.mp3`);
  currentVoice.volume = volume / 100;
  currentVoice.play().catch(e => console.log('Голос не загрузился:', e));
}

// ===== МЕНЮ НАСТРОЕК =====
function toggleSettings() {
  const menu = document.getElementById('settingsMenu');
  const btn = document.querySelector('.panel-settings');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
    return;
  }
  const btnRect = btn.getBoundingClientRect();
  menu.style.top = (btnRect.bottom + 5) + 'px';
  menu.style.left = (btnRect.right - 280) + 'px';
  menu.classList.add('show');
  playSound('soundButton', 'button');
}

document.addEventListener('click', function(e) {
  const menu = document.getElementById('settingsMenu');
  const btn = document.querySelector('.panel-settings');
  if (!btn.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

window.addEventListener('scroll', function() {
  const menu = document.getElementById('settingsMenu');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function toggleSound() {
  soundEnabled = document.getElementById('soundToggle').checked;
  playSound('soundButton', 'button');
}

function toggleMusic() {
  musicEnabled = document.getElementById('musicToggle').checked;
  const music = document.getElementById('bgMusic');
  if (musicEnabled) {
    music.volume = volume / 100 * soundLevels.bgMusic;
    music.play().catch(e => {});
  } else {
    music.pause();
  }
  playSound('soundButton', 'button');
}

function toggleVoice() {
  voiceEnabled = document.getElementById('voiceToggle').checked;
  playSound('soundButton', 'button');
}

function changeVolume(val) {
  volume = val;
  const music = document.getElementById('bgMusic');
  if (musicEnabled) {
    music.volume = volume / 100 * soundLevels.bgMusic;
  }
}

// ===== ТЕМЫ =====
function setTheme(theme) {
  document.body.classList.remove('theme-dark', 'theme-light', 'theme-business');
  document.body.classList.add(`theme-${theme}`);
  document.documentElement.classList.remove('theme-dark', 'theme-light', 'theme-business');
  document.documentElement.classList.add(`theme-${theme}`);
  localStorage.setItem('theme', theme);
  playSound('soundButton', 'button');

  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });

  if (chart) renderChart();
}

// ===== АССИСТЕНТ =====
function closeAssistantBubble(event) {
  event.stopPropagation();
  const bubble = document.querySelector('.assistant-bubble');
  const img = document.getElementById('assistantImg');
  
  if (bubble) {
    bubble.classList.add('hidden');
  }
  if (img) {
    img.classList.add('glow');
  }
}

function toggleAssistantBubble() {
  const bubble = document.querySelector('.assistant-bubble');
  const img = document.getElementById('assistantImg');
  
  if (bubble) {
    const wasHidden = bubble.classList.contains('hidden');
    bubble.classList.toggle('hidden');
    
    // Если облачко было открыто, а теперь закрылось (стало hidden)
    if (!wasHidden && bubble.classList.contains('hidden')) {
      // Добавляем подсветку
      if (img) img.classList.add('glow');
    }
    
    // Если облачко было закрыто, а теперь открылось
    if (wasHidden && !bubble.classList.contains('hidden')) {
      // Убираем подсветку
      if (img) img.classList.remove('glow');
    }
  }
}

// ============================================
// СЛОВАРЬ ТЕРМИНОВ
// ============================================
const dictionary = {
  inflation: {
    title: 'Инфляция',
    text: 'Рост цен. Если инфляция высокая, квартиры дорожают быстрее доходов. Даже с низкой ставкой ипотека становится неподъёмной.'
  },
  keyRate: {
    title: 'Ключевая ставка',
    text: 'Процент, под который Центробанк даёт кредиты банкам. Влияет на ипотеку, но не напрямую на цены.'
  },
  gdp: {
    title: 'ВВП',
    text: 'Рост экономики. Влияет на доходы людей. Чем выше ВВП, тем больше люди могут откладывать на жильё.'
  },
  housing: {
    title: 'Доступность жилья',
    text: 'Показывает, насколько легко семье купить квартиру. Зависит от цен, доходов и ипотеки. Это главная цель!'
  }
};

// ============================================
// СЛОВАРЬ ТЕРМИНОВ ДЛЯ СОБЫТИЙ
// ============================================
const eventDictionary = {
  'Рост цен на нефть': {
    title: 'Рост цен на нефть',
    definition: 'Нефть — основное сырьё для российской экономики. Когда цены на нефть растут, в страну поступает больше валютной выручки. Это укрепляет рубль, увеличивает доходы бюджета, но может вызвать "голландскую болезнь" — чрезмерное укрепление валюты, которое вредит другим отраслям.'
  },
  'Санкции': {
    title: 'Санкции',
    definition: 'Ограничительные меры со стороны других стран. Санкции могут затруднить доступ к международным кредитам, ограничить импорт технологий и вызвать отток капитала. Центральный банк в ответ часто повышает ключевую ставку, чтобы поддержать рубль и сдержать инфляцию.'
  },
  'Неурожай': {
    title: 'Неурожай',
    definition: 'Снижение объёма собранного урожая из-за погодных условий (засуха, заморозки). Приводит к дефициту и росту цен на продукты питания, что напрямую разгоняет инфляцию.'
  },
  'Новый завод': {
    title: 'Новый завод',
    definition: 'Открытие крупного промышленного производства. Создаёт новые рабочие места, увеличивает ВВП, стимулирует смежные отрасли. Положительно влияет на доходы населения.'
  },
  'Строительный бум': {
    title: 'Строительный бум',
    definition: 'Период активного ввода нового жилья. Увеличивает предложение на рынке, что может сдерживать рост цен на квартиры. Требует доступных кредитов для застройщиков и покупателей.'
  },
  'Рост доходов': {
    title: 'Рост доходов',
    definition: 'Увеличение реальных располагаемых доходов населения. Может быть вызвано ростом зарплат, пенсий, социальных выплат. Позволяет людям больше тратить и откладывать, в том числе на жильё.'
  },
  'Льготная ипотека': {
    title: 'Льготная ипотека',
    definition: 'Программа субсидирования государством ипотечных ставок. Делает кредиты доступнее, увеличивает спрос на жильё. Однако может привести к росту цен на квартиры, если предложение не успевает за спросом.'
  },
  'Инвестиции': {
    title: 'Инвестиции',
    definition: 'Вложения в развитие бизнеса и экономики. Иностранные инвестиции приносят капитал и технологии. Внутренние инвестиции показывают, что бизнес верит в будущее страны.'
  },
  'Рекордный урожай': {
    title: 'Рекордный урожай',
    definition: 'Высокий сбор сельскохозяйственной продукции. Увеличивает предложение продуктов, сдерживая рост цен на продовольствие. Хороший урожай способствует снижению инфляции.'
  },
  'Рост зарплат': {
    title: 'Рост зарплат',
    definition: 'Увеличение оплаты труда работников бюджетной сферы или в целом по экономике. Повышает покупательную способность населения, но может усилить инфляцию, если не сопровождается ростом производительности труда.'
  },
  'Малый бизнес растёт': {
    title: 'Малый бизнес растёт',
    definition: 'Активизация малого и среднего предпринимательства. Создаёт рабочие места, увеличивает конкуренцию, насыщает рынок товарами и услугами, способствует росту ВВП.'
  },
  'Технологический прорыв': {
    title: 'Технологический прорыв',
    definition: 'Внедрение новых технологий в производство. Повышает производительность труда, снижает издержки, что может сдерживать рост цен и давать импульс экономическому росту.'
  },
  'Банковский кризис': {
    title: 'Банковский кризис',
    definition: 'Ситуация, когда банки теряют способность выполнять свои обязательства. Сопровождается оттоком вкладов, сокращением кредитования. Подрывает доверие к финансовой системе.'
  },
  'Отток капитала': {
    title: 'Отток капитала',
    definition: 'Вывод инвесторами своих средств из страны. Ослабляет национальную валюту, снижает инвестиции в экономику, заставляет ЦБ повышать ставку для защиты рубля.'
  }
};

// ============================================
// СТИЛИ УПРАВЛЕНИЯ
// ============================================
const leadershipStyles = {
  conservative: { name: 'Консерватор', trustBonus: 15, businessModifier: 0.7, inflationResistance: 10 },
  reformer: { name: 'Реформатор', trustBonus: -10, businessModifier: 1.4, inflationResistance: -5 },
  populist: { name: 'Народный лидер', trustBonus: 20, businessModifier: 0.5, inflationResistance: -10 },
  technocrat: { name: 'Технократ', trustBonus: 5, businessModifier: 1.0, inflationResistance: 5 }
};

// ============================================
// СЛУЧАЙНЫЕ СОБЫТИЯ (14 шт, 70% хороших)
// ============================================
const events = [
  { icon: '🛢️', name: 'Рост цен на нефть', text: 'Нефть подорожала, рубль укрепляется', type: 'positive',
    inflation: -3, gdp: +2, trust: +1 },
  { icon: '🏭', name: 'Новый завод', text: 'Открылось крупное производство', type: 'positive',
    gdp: +3, housing: +2, trust: +3 },
  { icon: '🏗️', name: 'Строительный бум', text: 'Введено рекордное количество жилья', type: 'positive',
    housing: +8, gdp: +2 },
  { icon: '📊', name: 'Рост доходов', text: 'Реальные доходы населения выросли', type: 'positive',
    housing: +4, trust: +5 },
  { icon: '🏠', name: 'Льготная ипотека', text: 'Государство субсидирует ипотеку', type: 'positive',
    housing: +5, inflation: +2 },
  { icon: '🤝', name: 'Инвестиции', text: 'Крупные иностранные инвестиции', type: 'positive',
    gdp: +3, housing: +2, trust: +2 },
  { icon: '🌱', name: 'Рекордный урожай', text: 'Сельское хозяйство процветает', type: 'positive',
    inflation: -4, gdp: +2, trust: +3 },
  { icon: '🏥', name: 'Рост зарплат', text: 'Бюджетники получили повышение', type: 'positive',
    housing: +3, trust: +4 },
  { icon: '💼', name: 'Малый бизнес растёт', text: 'Открылось много новых предприятий', type: 'positive',
    gdp: +2, housing: +2, trust: +3 },
  { icon: '🔧', name: 'Технологический прорыв', text: 'Новые разработки в промышленности', type: 'positive',
    gdp: +4, inflation: -2, trust: +2 },
  
  { icon: '🌾', name: 'Неурожай', text: 'Засуха привела к росту цен на продукты', type: 'negative', 
    inflation: +5, gdp: -1, trust: -2 },
  { icon: '🌍', name: 'Санкции', text: 'Новые ограничения внешней торговли', type: 'negative',
    inflation: +3, gdp: -2, housing: -1, trust: -3 },
  { icon: '🏦', name: 'Банковский кризис', text: 'Несколько банков на грани краха', type: 'negative',
    inflation: +2, gdp: -3, trust: -6 },
  { icon: '💼', name: 'Отток капитала', text: 'Инвесторы выводят деньги', type: 'negative',
    inflation: +2, gdp: -2, trust: -4 }
];

// ============================================
// СЦЕНАРИИ
// ============================================
const scenarios = {
  'russia90': {
    name: 'Россия 1992',
    wiki: 'https://ru.wikipedia.org/wiki/Экономические_реформы_в_России_(1990-е_годы)',
    startYear: 1992,
    initial: { inflation: 2508, keyRate: 100, gdp: -14.5, housing: 8 },
    goal: 'Цель: инфляция < 300%, жильё > 12',
    targetInflation: 300,
    targetHousing: 12,
    description: 'Гиперинфляция',
    historicalFact: 'В 1992 году цены выросли в 26 раз (инфляция 2508%)! Квартиры подорожали так, что стали недоступны.',
    icon: '🔥'
  },
  'russia98': {
    name: 'Россия 1998',
    wiki: 'https://ru.wikipedia.org/wiki/Экономический_кризис_в_России_(1998)',
    startYear: 1998,
    initial: { inflation: 84, keyRate: 60, gdp: -5.3, housing: 8 },
    goal: 'Цель: инфляция < 30%, жильё > 15',
    targetInflation: 30,
    targetHousing: 15,
    description: 'Дефолт',
    historicalFact: 'После дефолта 1998 года инфляция подскочила до 84%, но затем снижалась.',
    icon: '📉'
  },
  'russia00': {
    name: 'Россия 2000',
    wiki: 'https://ru.wikipedia.org/wiki/Экономика_России_в_2000-х',
    startYear: 2000,
    initial: { inflation: 20.2, keyRate: 25, gdp: 10.0, housing: 22 },
    goal: 'Цель: инфляция < 12%, жильё > 35',
    targetInflation: 12,
    targetHousing: 35,
    description: 'Нефтяной бум',
    historicalFact: '2000-е: нефть росла, доходы увеличивались, жильё становилось доступнее.',
    icon: '📈'
  },
  'russia08': {
    name: 'Россия 2008',
    wiki: 'https://ru.wikipedia.org/wiki/Мировой_экономический_кризис_(2008)',
    startYear: 2008,
    initial: { inflation: 14.1, keyRate: 13, gdp: 5.2, housing: 35 },
    goal: 'Цель: инфляция < 8%, жильё > 45',
    targetInflation: 8,
    targetHousing: 45,
    description: 'Мировой финансовый кризис.',
    historicalFact: 'В 2008 году инфляция достигла 14,1%, ЦБ повышал ставку.',
    icon: '🌍'
  },
  'russia14': {
    name: 'Россия 2014',
    wiki: 'https://ru.wikipedia.org/wiki/Экономический_кризис_в_России_(2014—2015)',
    startYear: 2014,
    initial: { inflation: 11.4, keyRate: 17, gdp: 0.7, housing: 45 },
    goal: 'Цель: инфляция < 7%, жильё > 50',
    targetInflation: 7,
    targetHousing: 50,
    description: 'Санкции и адаптация.',
    historicalFact: '2014: санкции, обвал рубля. ЦБ поднял ставку до 17%, чтобы спасти рубль.',
    icon: '🔒'
  },
  'russia22': {
    name: 'Россия 2022',
    wiki: 'https://ru.wikipedia.org/wiki/Санкции_против_России_(2022)',
    startYear: 2022,
    initial: { inflation: 11.9, keyRate: 20, gdp: -1.2, housing: 48 },
    goal: 'Цель: инфляция < 8%, жильё > 50',
    targetInflation: 8,
    targetHousing: 50,
    description: 'Санкционный удар',
    historicalFact: '2022: новые санкции, ставка 20%, но экономика выстояла.',
    icon: '⚡'
  },
 'russia26': {
  name: 'Россия 2026',
  wiki: 'https://cbr.ru',
  startYear: 2026,
  initial: { 
    inflation: 6.0,
    keyRate: 15.5,
    gdp: 1.0,
    housing: 52,
    trust: 68
  },
  goal: 'Цель: инфляция 4%, жильё > 55',
  targetInflation: 4,
  targetHousing: 55,
  description: 'Текущая экономическая ситуация',
  historicalFact: '2026: возвращение к таргету 4%',
  icon: '🇷🇺'
},
  'sandbox': {
    name: '🧪 Свободная игра',
    wiki: '#',
    startYear: 2024,
    initial: { inflation: 7, keyRate: 10, gdp: 2, housing: 50, trust: 50 },
    goal: 'Экспериментируйте без целей',
    targetInflation: 999,
    targetHousing: 0,
    description: 'Пробуйте разные стратегии без ограничений.',
    historicalFact: 'Здесь нет истории — только экономика.',
    icon: '🧪'
  }
};

// Состояние игры
let currentScenario = 'russia26'; // Начинаем с 2026 года
let currentMeeting = 0;
let gameState = {
  inflation: [],
  keyRate: [],
  gdp: [],
  housing: [],
  trust: [],
  apartmentPrice: [],
  income: []
};
let gameFinished = false;
let chart;
let currentStyle = null;

function pluralizeYears(years) {
  const num = Math.floor(years);
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'лет';
  if (lastDigit === 1) return 'год';
  if (lastDigit >= 2 && lastDigit <= 4) return 'года';
  return 'лет';
}

function loadStyle() {
  const styleId = localStorage.getItem('leadershipStyle') || 'technocrat';
  currentStyle = leadershipStyles[styleId];
}

function loadScenario(scenarioId) {
  currentScenario = scenarioId;
  const s = scenarios[scenarioId];
  currentMeeting = 0;
  
  const baseApartmentPrice = scenarioId === 'russia90' ? 0.5 :
                             scenarioId === 'russia98' ? 0.6 :
                             scenarioId === 'russia00' ? 1.5 :
                             scenarioId === 'russia08' ? 3.5 :
                             scenarioId === 'russia14' ? 4.5 :
                             scenarioId === 'russia22' ? 7.2 : 10;
                             scenarioId === 'russia26' ? 12.5 : 10;

  const baseIncome = scenarioId === 'russia90' ? 20 :
                     scenarioId === 'russia98' ? 25 :
                     scenarioId === 'russia00' ? 8 :
                     scenarioId === 'russia08' ? 30 :
                     scenarioId === 'russia14' ? 45 :
                     scenarioId === 'russia22' ? 70 : 80;
                     scenarioId === 'russia26' ? 95 : 80;

  gameState = {
    inflation: [s.initial.inflation],
    keyRate: [s.initial.keyRate],
    gdp: [s.initial.gdp * (currentStyle?.businessModifier || 1.0)],
    housing: [s.initial.housing],
    trust: [50 + (currentStyle?.trustBonus || 0)],
    apartmentPrice: [baseApartmentPrice],
    income: [baseIncome]
  };
  
  gameFinished = false;

  document.getElementById('wikiLinkA').href = s.wiki;
  document.getElementById('wikiLinkA').textContent = `📖 ${s.name}`;
  
  if (scenarioId === 'sandbox') {
    document.getElementById('scenarioGoal').innerHTML = `<span class="goal-text">🧪 Свободный режим. Нет целей, только эксперименты.</span>`;
  } else {
    document.getElementById('scenarioGoal').innerHTML = `<span class="goal-text">🎯 ${s.goal}</span>`;
  }

   // Сбрасываем счётчики событий
  eventsThisGame = 0;
  lastEventTurn = -10;
  eventProbability = 0.1;

  updateUI();
  updateForecast();
  updateAssistantBasedOnSituation();
  
  if (!hasGreeted) {
    playVoice(1);
    hasGreeted = true;
  }
}

function calculateApartmentPrice(inflation, prevPrice, prevIncome, gdp) {
  const priceGrowth = inflation * 0.5;
  const newPrice = prevPrice * (1 + priceGrowth / 100);
  const incomeGrowth = Math.max(0, gdp * 0.8);
  const newIncome = prevIncome * (1 + incomeGrowth / 100);
  return { price: newPrice, income: newIncome };
}

function updateUI() {
  if (gameFinished) {
    showResult();
    return;
  }

  const s = scenarios[currentScenario];
 // логика заседаний //
 const yearOffset = Math.floor(currentMeeting / 8);
 const quarterNum = Math.floor((currentMeeting % 8) / 2) + 1; 
 const meetingInQuarter = (currentMeeting % 2) + 1;
 const currentRealYear = s.startYear + yearOffset;
  
  document.getElementById('meetingDisplay').textContent = `${currentMeeting+1}/16`;
  document.getElementById('yearDisplay').textContent = currentRealYear;
  
  const quarters = ['I', 'II', 'III', 'IV'];
  document.getElementById('quarterDisplay').textContent = quarters[quarterNum-1] + ' квартал';

  const infl = gameState.inflation[currentMeeting];
  const rate = gameState.keyRate[currentMeeting];
  const gdp = gameState.gdp[currentMeeting];
  const house = gameState.housing[currentMeeting];
  const trust = gameState.trust[currentMeeting];
  const realRate = (rate - infl).toFixed(1);
  
  const apartmentPrice = gameState.apartmentPrice[currentMeeting];
  const income = gameState.income[currentMeeting];
  const years = apartmentPrice * 1000 / income / 12;

  document.getElementById('trustFill').style.width = trust + '%';
  document.getElementById('trustValue').textContent = trust + '%';

  const inflCritical = (currentScenario !== 'sandbox' && infl > s.targetInflation * 1.5) ? 'critical' : (currentScenario !== 'sandbox' && infl <= s.targetInflation ? 'good' : '');
  const houseCritical = (currentScenario !== 'sandbox' && house < s.targetHousing * 0.7) ? 'critical' : (currentScenario !== 'sandbox' && house >= s.targetHousing ? 'good' : '');
  const realRateCritical = realRate < 0 ? 'critical' : (realRate > 5 ? 'good' : '');

  const metricsHtml = `
    <div class="metric-card ${inflCritical}">
      <div class="metric-header">
        <span class="metric-name">📈 Инфляция</span>
        <span class="help-icon" onclick="showTerm('inflation')">ⓘ</span>
      </div>
      <div class="metric-value">${infl.toFixed(1)}%</div>
      <div class="metric-detail">⬆️ Цены растут</div>
    </div>
    <div class="metric-card ${realRateCritical}">
      <div class="metric-header">
        <span class="metric-name">💰 Ключевая ставка</span>
        <span class="help-icon" onclick="showTerm('keyRate')">ⓘ</span>
      </div>
      <div class="metric-value">${rate.toFixed(1)}%</div>
      <div class="real-rate">Реальная: ${realRate}%</div>
      <div class="metric-detail">${realRate < 0 ? '⚠️ Деньги тают' : realRate > 5 ? '✅ Деньги защищены' : ''}</div>
    </div>
    <div class="metric-card">
      <div class="metric-header">
        <span class="metric-name">🏭 ВВП</span>
        <span class="help-icon" onclick="showTerm('gdp')">ⓘ</span>
      </div>
      <div class="metric-value">${gdp > 0 ? '+' : ''}${gdp.toFixed(1)}%</div>
      <div class="metric-detail">💰 Доходы: ${income.toFixed(0)} тыс.₽/мес</div>
    </div>
    <div class="metric-card ${houseCritical}">
      <div class="metric-header">
        <span class="metric-name">🏠 Доступность жилья</span>
        <span class="help-icon" onclick="showTerm('housing')">ⓘ</span>
      </div>
      <div class="metric-value">${house.toFixed(0)}/100</div>
      <div class="metric-detail">🏢 Квартира: ${apartmentPrice.toFixed(1)} млн ₽</div>
      <div class="metric-detail">📊 Соотношение: ${years.toFixed(1)} ${pluralizeYears(years)} дохода</div>
    </div>
  `;
  document.getElementById('metricsGrid').innerHTML = metricsHtml;
  
  showHints();

  const slider = document.getElementById('keyRateSlider');
  slider.value = rate;
  document.getElementById('rateDisplay').textContent = rate.toFixed(1) + '%';

  renderChart();
}

function showHints() {
  ['inflation', 'keyRate', 'gdp', 'housing'].forEach(m => {
    const el = document.getElementById(`hint-${m}`);
    if (el) el.classList.add('show');
  });
}

function updateForecast() {
  const slider = document.getElementById('keyRateSlider');
  const newRate = parseFloat(slider.value);
  const currentInfl = gameState.inflation[currentMeeting];
  const forecastInfl = Math.max(3, currentInfl - (newRate - 10) * 1.2);
  document.getElementById('forecastText').innerHTML = `инфляция ≈ ${forecastInfl.toFixed(1)}%`;
}

function renderChart() {
  const ctx = document.getElementById('economyChart').getContext('2d');
  const s = scenarios[currentScenario];
  
  const labels = [];
  for (let i = 0; i <= currentMeeting; i++) {
    const year = s.startYear + Math.floor(i / 4);
    const quarter = (i % 4) + 1;
    labels.push(`${year} Q${quarter}`);
  }

  if (chart) chart.destroy();

  const bodyClass = document.body.className;
  const textColor = bodyClass.includes('theme-light') ? '#0a1e32' : (bodyClass.includes('theme-business') ? '#f0ead2' : 'white');
  const gridColor = bodyClass.includes('theme-light') ? 'rgba(10,30,50,0.1)' : 'rgba(255,255,255,0.1)';

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Инфляция', data: gameState.inflation.slice(0, currentMeeting+1), backgroundColor: '#ff6384' },
        { label: 'Ставка', data: gameState.keyRate.slice(0, currentMeeting+1), backgroundColor: '#36a2eb' },
        { label: 'ВВП', data: gameState.gdp.slice(0, currentMeeting+1), backgroundColor: '#4caf50' },
        { label: 'Жильё', data: gameState.housing.slice(0, currentMeeting+1), backgroundColor: '#ffcd56' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: gridColor },
          ticks: { color: textColor }
        },
        x: {
          ticks: { color: textColor, maxRotation: 45 }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

function triggerRandomEvent() {

      // Не чаще чем раз в minTurnsBetweenEvents ходов
  if (currentMeeting - lastEventTurn < minTurnsBetweenEvents) return;
  
  // Первые 2 хода и последние 2 хода - событий нет
  if (currentMeeting < 2 || currentMeeting > 13) return;
  
  if (Math.random() > 0.2) return;

  const event = events[Math.floor(Math.random() * events.length)];
  const lastIdx = gameState.inflation.length - 1;
  
  if (event.inflation) gameState.inflation[lastIdx] = Math.max(3, Math.min(300, gameState.inflation[lastIdx] + event.inflation));
  if (event.gdp) gameState.gdp[lastIdx] = Math.max(-20, Math.min(15, gameState.gdp[lastIdx] + event.gdp));
  if (event.housing) gameState.housing[lastIdx] = Math.max(0, Math.min(100, gameState.housing[lastIdx] + event.housing));
  if (event.trust) gameState.trust[lastIdx] = Math.max(0, Math.min(100, gameState.trust[lastIdx] + event.trust));

  const priceData = calculateApartmentPrice(
    gameState.inflation[lastIdx], 
    gameState.apartmentPrice[lastIdx], 
    gameState.income[lastIdx],
    gameState.gdp[lastIdx]
  );
  gameState.apartmentPrice[lastIdx] = priceData.price;
  gameState.income[lastIdx] = priceData.income;

  let effectsStr = '';
  if (event.inflation) effectsStr += `Инфляция: ${event.inflation > 0 ? '+' : ''}${event.inflation}% `;
  if (event.gdp) effectsStr += `ВВП: ${event.gdp > 0 ? '+' : ''}${event.gdp}% `;
  if (event.housing) effectsStr += `Жильё: ${event.housing > 0 ? '+' : ''}${event.housing} `;
  if (event.trust) effectsStr += `Доверие: ${event.trust > 0 ? '+' : ''}${event.trust}%`;

  const hasDefinition = eventDictionary.hasOwnProperty(event.name);
  
  let eventHtml = `
    <div style="font-size:64px; margin-bottom:20px;">${event.icon}</div>
    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap;">
      <h2 style="color: ${event.type === 'positive' ? '#4caf50' : '#ff6b4a'}; margin: 0;">${event.name}</h2>
      ${hasDefinition ? `<button class="info-btn-event" onclick="showEventTermDefinition('${event.name.replace(/'/g, "\\'")}')">!</button>` : ''}
    </div>
    <p style="margin:20px 0; font-size:18px;">${event.text}</p>
    <p style="font-size:16px; background:rgba(0,0,0,0.2); padding:10px; border-radius:20px;"><strong>Эффекты:</strong> ${effectsStr}</p>
  `;
  
  if (event.name === 'Санкции') {
    eventHtml += `<p style="font-style:italic; color:#ffd966;">Исторический факт: санкции 2014 и 2022 годов заставляли ЦБ повышать ставку</p>`;
  } else if (event.name === 'Неурожай') {
    eventHtml += `<p style="font-style:italic; color:#ffd966;">Исторический факт: неурожай 2010 года разогнал инфляцию до 8,8%</p>`;
  } else if (event.name === 'Рост цен на нефть') {
    eventHtml += `<p style="font-style:italic; color:#ffd966;">Исторический факт: в 2000-х нефть по 140$ помогла росту доходов</p>`;
  }
  
  if (event.type === 'negative') {
    eventHtml += `
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button class="close-modal" onclick="closeEvent()">Понятно</button>
        <button class="primary-btn" onclick="emergencyMeeting()" style="background: #b22222;">🚨 Экстренное заседание</button>
      </div>
    `;
    playVoice(16);
} else {
  eventHtml += `<div style="display: flex; justify-content: center; margin-top: 20px;"><button class="close-modal" onclick="closeEvent()">Понятно</button></div>`;
}
  
  document.getElementById('eventContent').innerHTML = eventHtml;
  document.getElementById('eventModal').style.display = 'flex';
  
  if (event.type === 'positive') {
  playSound('soundNews', 'news');
} else {
  playSound('soundNoise', 'noise');
}
}

function emergencyMeeting() {
  document.getElementById('eventModal').style.display = 'none';
  playSound('soundBell', 'bell');
  playVoice(13);
  
  const currentRate = gameState.keyRate[currentMeeting];
  
  const emergencyHtml = `
    <div style="text-align: center;">
      <div style="font-size:64px; margin-bottom:20px;">🚨</div>
      <h2 style="color: #ff6b4a;">ЭКСТРЕННОЕ ЗАСЕДАНИЕ</h2>
      <p style="margin:20px 0;">Измените ключевую ставку прямо сейчас</p>
      <div style="margin: 30px 0;">
        <p style="margin-bottom:10px;">Текущая ставка: ${currentRate.toFixed(1)}%</p>
        <p>Новая ставка: <span id="emergencyRate" style="font-size:32px; color:#ffd966;">${currentRate.toFixed(1)}%</span></p>
        <input type="range" id="emergencySlider" min="0" max="200" value="${currentRate}" step="0.5" style="width:100%; margin:20px 0;">
      </div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="close-modal" onclick="closeEmergency()">Отложить</button>
        <button class="primary-btn" onclick="applyEmergencyDecision()" style="background: #b22222;">✅ Применить</button>
      </div>
    </div>
  `;
  
  document.getElementById('eventContent').innerHTML = emergencyHtml;
  document.getElementById('eventModal').style.display = 'flex';
  
  setTimeout(() => {
    const slider = document.getElementById('emergencySlider');
    if (slider) {
      slider.addEventListener('input', function(e) {
        document.getElementById('emergencyRate').textContent = e.target.value + '%';
      });
    }
  }, 100);
}

function closeEmergency() {
  document.getElementById('eventModal').style.display = 'none';
  playVoice(4);
}

function applyEmergencyDecision() {
  const newRate = parseFloat(document.getElementById('emergencySlider').value);
  gameState.keyRate[currentMeeting] = newRate;
  document.getElementById('eventModal').style.display = 'none';
  playSound('soundCash', 'cash');
  playVoice(18);
  document.getElementById('keyRateSlider').value = newRate;
  document.getElementById('rateDisplay').textContent = newRate.toFixed(1) + '%';
  updateUI();
  updateForecast();
  updateAssistantBasedOnSituation();   
}

function closeEvent() {
  document.getElementById('eventModal').style.display = 'none';
}

function showEventTermDefinition(eventName) {
  const termData = eventDictionary[eventName];
  if (!termData) return;
  
  document.getElementById('termDefinitionTitle').textContent = termData.title;
  document.getElementById('termDefinitionText').textContent = termData.definition;
  document.getElementById('termDefinitionModal').style.display = 'flex';
  playSound('soundButton', 'button');
}

function closeTermDefinitionModal() {
  document.getElementById('termDefinitionModal').style.display = 'none';
}

function updateAssistantBasedOnSituation() {
  const s = scenarios[currentScenario];
  const infl = gameState.inflation[currentMeeting];
  const rate = gameState.keyRate[currentMeeting];
  const house = gameState.housing[currentMeeting];
  const prevHouse = currentMeeting > 0 ? gameState.housing[currentMeeting-1] : house;
  const houseChange = house - prevHouse;
  const real = rate - infl;
  const trust = gameState.trust[currentMeeting];
  const price = gameState.apartmentPrice[currentMeeting];
  const income = gameState.income[currentMeeting];
  
  let advice = '';
  let voicePhrase = null;

  if (trust < 20) {
      advice = '🔴 Доверие критически низкое! Люди не верят вашей политике. Срочно принимайте меры.';
      voicePhrase = 16;
  } else if (infl > 1000) {
      advice = '🔥 Катастрофическая инфляция! Срочно поднимайте ставку выше 150%!';
      voicePhrase = 6;
  } else if (houseChange < -3) {
      advice = '📉 Доступность жилья падает! Это доказывает, что снижение ставки не помогает. Следите за инфляцией.';
      voicePhrase = 10;
  } else if (houseChange < -1) {
    advice = '📉 Доступность жилья немного снижается. Следите за инфляцией.';
    voicePhrase = null; // без голоса
  } else if (houseChange > 2) {
      advice = '📈 Доступность жилья растёт! Вы на верном пути. Продолжайте в том же духе.';
      voicePhrase = 18;
  } else if (real < -5) {
      advice = '🔴 Реальная ставка сильно отрицательная! Деньги тают, люди скупают недвижимость, цены растут. Срочно поднимайте ставку!';
      voicePhrase = 6;
  } else if (real < 0) {
      advice = '⚠️ Реальная ставка отрицательная. Деньги обесцениваются, квартиры дорожают. Это не помогает доступности.';
      voicePhrase = 3;
  } else if (real > 5 && real < 10) {
      advice = '✅ Реальная ставка положительная, умеренная. Отличный баланс для стабильности.';
      voicePhrase = 4;
  } else if (real >= 10) {
      advice = '💰 Реальная ставка высокая. Экономика может замедлиться. Можно немного снизить для стимулирования роста.';
      voicePhrase = 4;
  } else if (currentScenario !== 'sandbox') {
      if (house < s.targetHousing) {
          advice = `🏚️ Жильё всё ещё недоступно. Чтобы его повысить, нужна стабильная экономика. Сейчас цена квартиры ${price.toFixed(1)} млн, доход ${income.toFixed(0)} тыс.`;
          voicePhrase = 10;
      } else if (infl > s.targetInflation) {
          advice = `⚠️ Инфляция выше цели. Держите ставку на уровне ${Math.ceil(infl + 2)}% или выше.`;
          voicePhrase = 7;
      } else {
          advice = '✅ Цели достигнуты! Отличная работа. Продолжайте в том же духе.';
          voicePhrase = 4;
      }
  } else {
      const tips = [
          'Главное — следить за реальной ставкой.',
          'Помните: снижение ставки не гарантирует доступность жилья.',
          'Сбалансированная политика — ключ к успеху.',
          'Наблюдайте за динамикой цен и доходов.'
      ];
      advice = tips[Math.floor(Math.random() * tips.length)];
      voicePhrase = 4;
  }

  document.getElementById('assistantMessage').textContent = advice;
  if (voicePhrase) playVoice(voicePhrase);
}

function openScenarioMenu() {
  const grid = document.getElementById('scenarioGrid');
  grid.innerHTML = '';
  
  Object.keys(scenarios).forEach(key => {
    const s = scenarios[key];
    const option = document.createElement('div');
    option.className = 'scenario-option';
    option.onclick = () => {
      playSound('soundButton', 'button');
      loadScenario(key);
      closeScenarioMenu();
    };
    option.innerHTML = `
      <h4>${s.icon} ${s.name}</h4>
      <p>${s.description}</p>
    `;
    grid.appendChild(option);
  });
  
  document.getElementById('scenarioModal').style.display = 'flex';
  playSound('soundButton', 'button');
}

function closeScenarioMenu() {
  document.getElementById('scenarioModal').style.display = 'none';
}

function applyDecision() {
  if (gameFinished) return;
  if (currentMeeting >= 15) {
    gameFinished = true;
    showResult();
    return;
  }

  const newRate = parseFloat(document.getElementById('keyRateSlider').value);
  const currentInfl = gameState.inflation[currentMeeting];
  const currentGdp = gameState.gdp[currentMeeting];
  const currentHouse = gameState.housing[currentMeeting];
  const currentTrust = gameState.trust[currentMeeting];
  const currentPrice = gameState.apartmentPrice[currentMeeting];
  const currentIncome = gameState.income[currentMeeting];

  let nextInfl = currentInfl - (newRate - 10) * 1.2 + (Math.random() * 4 - 2);
  nextInfl = Math.max(3, Math.min(300, nextInfl));

  let nextGdp = currentGdp + (10 - newRate) * 0.2 - (currentInfl > 50 ? 2 : 0);
  nextGdp = Math.max(-20, Math.min(15, nextGdp));
  nextGdp *= (currentStyle?.businessModifier || 1.0);

  let realRate = newRate - nextInfl;
  let houseChange = (8 - newRate) * 0.2 - (nextInfl / 15) + (nextGdp * 0.3);
  if (realRate < -5) houseChange -= 2;
  if (realRate > 5) houseChange += 1;
  let nextHouse = currentHouse + houseChange;
  nextHouse = Math.max(0, Math.min(100, nextHouse));

  let trustChange = 0;
  if (newRate > currentInfl) trustChange += 2;
  if (newRate < currentInfl - 10) trustChange -= 3;
  if (nextGdp > currentGdp) trustChange += 1;
  if (nextHouse < currentHouse) trustChange -= 1;

  let nextTrust = currentTrust + trustChange;
  nextTrust = Math.max(0, Math.min(100, nextTrust));

  const priceData = calculateApartmentPrice(nextInfl, currentPrice, currentIncome, nextGdp);

  gameState.keyRate.push(newRate);
  gameState.inflation.push(nextInfl);
  gameState.gdp.push(nextGdp);
  gameState.housing.push(nextHouse);
  gameState.trust.push(nextTrust);
  gameState.apartmentPrice.push(priceData.price);
  gameState.income.push(priceData.income);

  currentMeeting++;

 if (nextTrust < 15) {
    gameFinished = true;
    showTrustLossModal(); // показываем модалку проигрыша из-за доверия
    return; // прекращаем выполнение функции
 }

  playSound('soundCash', 'cash');
  updateUI();
  updateForecast();
  updateAssistantBasedOnSituation();
  triggerRandomEvent();
  
  if (nextHouse > currentHouse && nextInfl < currentInfl) playVoice(18);
}

function showWhatIf() {
  const currentRate = parseFloat(document.getElementById('keyRateSlider').value);
  const currentInfl = gameState.inflation[currentMeeting];
  const currentGdp = gameState.gdp[currentMeeting];
  const currentHouse = gameState.housing[currentMeeting];
  const currentPrice = gameState.apartmentPrice[currentMeeting];
  const currentIncome = gameState.income[currentMeeting];
  
  // Сценарий 1: снижение ставки
  const lowerRate = Math.max(0, currentRate - 5);
  const lowerInfl = Math.max(3, currentInfl - (lowerRate - 10) * 1.2);
  const lowerGdp = currentGdp + (10 - lowerRate) * 0.2 - (currentInfl > 50 ? 2 : 0);
  const lowerHouse = currentHouse + (10 - lowerRate) * 0.3 - (lowerInfl / 30) + (lowerGdp * 0.2);
  const lowerPrice = currentPrice * (1 + lowerInfl * 0.5 / 100);
  
  // Сценарий 2: повышение ставки
  const higherRate = Math.min(200, currentRate + 5);
  const higherInfl = Math.max(3, currentInfl - (higherRate - 10) * 1.2);
  const higherGdp = currentGdp + (10 - higherRate) * 0.2 - (currentInfl > 50 ? 2 : 0);
  const higherHouse = currentHouse + (10 - higherRate) * 0.3 - (higherInfl / 30) + (higherGdp * 0.2);
  const higherPrice = currentPrice * (1 + higherInfl * 0.5 / 100);
  
  // Сценарий 3: оставить ставку как есть
  const sameRate = currentRate;
  const sameGdp = currentGdp + (10 - sameRate) * 0.2 - (currentInfl > 50 ? 2 : 0);
  const sameHouse = currentHouse + (10 - sameRate) * 0.3 - (currentInfl / 30) + (sameGdp * 0.2);
  const samePrice = currentPrice * (1 + currentInfl * 0.5 / 100);
  
const whatIfHtml = `
  <h3 style="color:#ffd966; margin-bottom:20px; text-align:center;">🔮 Что будет, если...</h3>
  
  <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
    <div style="background:rgba(255,107,74,0.2); padding:15px; border-radius:30px;">
      <h4 style="color:#ff6b4a; margin-bottom:8px;">📉 СНИЗИТЬ</h4>
      <p>Ставка: ${lowerRate.toFixed(1)}%</p>
      <p>Инфляция: ${lowerInfl.toFixed(1)}%</p>
      <p>ВВП: ${lowerGdp > 0 ? '+' : ''}${lowerGdp.toFixed(1)}%</p>
      <p>Жильё: ${Math.max(0, Math.min(100, lowerHouse)).toFixed(0)}/100</p>
      <p>Цена: ${lowerPrice.toFixed(1)} млн ₽</p>
      <p style="color:${lowerInfl > currentInfl ? '#ff6b4a' : '#4caf50'}">
        ${lowerInfl > currentInfl ? '⚠️ Инфляция вырастет' : '✅ Инфляция снизится'}
      </p>
    </div>
    
    <div style="background:rgba(255,215,0,0.2); padding:15px; border-radius:30px;">
      <h4 style="color:#ffd966; margin-bottom:8px;">⚖️ ОСТАВИТЬ</h4>
      <p>Ставка: ${sameRate.toFixed(1)}%</p>
      <p>Инфляция: ${currentInfl.toFixed(1)}%</p>
      <p>ВВП: ${sameGdp > 0 ? '+' : ''}${sameGdp.toFixed(1)}%</p>
      <p>Жильё: ${Math.max(0, Math.min(100, sameHouse)).toFixed(0)}/100</p>
      <p>Цена: ${samePrice.toFixed(1)} млн ₽</p>
      <p style="color:#ffd966;">🔸 Текущая политика</p>
    </div>

    <div style="background:rgba(76,175,80,0.2); padding:15px; border-radius:30px;">
      <h4 style="color:#4caf50; margin-bottom:8px;">📈 ПОВЫСИТЬ</h4>
      <p>Ставка: ${higherRate.toFixed(1)}%</p>
      <p>Инфляция: ${higherInfl.toFixed(1)}%</p>
      <p>ВВП: ${higherGdp > 0 ? '+' : ''}${higherGdp.toFixed(1)}%</p>
      <p>Жильё: ${Math.max(0, Math.min(100, higherHouse)).toFixed(0)}/100</p>
      <p>Цена: ${higherPrice.toFixed(1)} млн ₽</p>
      <p style="color:${higherInfl < currentInfl ? '#4caf50' : '#ff6b4a'}">
        ${higherInfl < currentInfl ? '✅ Инфляция снизится' : '⚠️ Инфляция вырастет'}
      </p>
    </div>
  </div>
  
  <p style="margin-top:20px; font-style:italic; color:#ffd966; text-align:center;">
    💡 Главное: снижение ставки без учёта инфляции делает квартиры дороже!
  </p>
  
  <div class="modal-footer">
    <button class="modal-btn" onclick="closeWhatIf()">Продолжить</button>
  </div>
`;
  
  document.getElementById('whatIfContent').innerHTML = whatIfHtml;
  document.getElementById('whatIfModal').style.display = 'flex';
  playSound('soundButton', 'button');
}

function closeWhatIf() {
  document.getElementById('whatIfModal').style.display = 'none';
}

function showResult() {
  const s = scenarios[currentScenario];
  const finalHouse = gameState.housing[15] || gameState.housing[gameState.history - 1];
  const finalInfl = gameState.inflation[15] || gameState.inflation[gameState.inflation.length - 1];
  const finalTrust = gameState.trust[15] || gameState.trust[gameState.trust.length - 1];
  const finalPrice = gameState.apartmentPrice[15] || gameState.apartmentPrice[gameState.apartmentPrice.length - 1];
  const finalIncome = gameState.income[15] || gameState.income[gameState.income.length - 1];
  const years = finalPrice * 1000 / finalIncome / 12;
  
  // Определяем победу или поражение
  let win = false;
  let lossReason = '';
  
  if (currentScenario !== 'sandbox') {
    win = finalInfl <= s.targetInflation && finalHouse >= s.targetHousing && finalTrust >= 30;
    
    // Если не победили, определяем причину
    if (!win) {
      if (finalTrust < 30) lossReason = 'доверие';
      else if (finalInfl > s.targetInflation) lossReason = 'инфляция';
      else if (finalHouse < s.targetHousing) lossReason = 'жилье';
    }
  } else {
    win = true; // в песочнице всегда победа
  }

  // Звук победы
  if (win && currentScenario !== 'sandbox') {
    playSound('soundVictoryFanfare', 'victory');
    playVoice(19);
  }

  // Анализ мифа
  let mythAnalysis = '';
  if (currentScenario === 'sandbox') {
    mythAnalysis = '🧪 Вы завершили эксперимент. Надеемся, вы лучше поняли взаимосвязи.';
  } else if (finalInfl > s.targetInflation && finalHouse < s.targetHousing) {
    mythAnalysis = '⚡ МИФ ПОДТВЕРДИЛСЯ? Нет! Вы увидели, что снижение ставки без контроля инфляции привело к росту цен. Жильё стало менее доступным.';
  } else if (finalInfl <= s.targetInflation && finalHouse >= s.targetHousing) {
    mythAnalysis = '🏆 МИФ РАЗВЕНЧАН! Вы нашли баланс: низкая инфляция и доступное жильё. Ставка — не главное, важен комплекс мер.';
  } else {
    mythAnalysis = '📚 ГЛАВНЫЙ УРОК: ключевая ставка влияет, но не решает всё. Доступность жилья зависит от инфляции, доходов и доверия.';
  }

  // Формируем результат в зависимости от победы/поражения
  let resultHtml = '';
  
  if (win) {
    // ПОБЕДА
    resultHtml = `
      <h2 class="win" style="margin-bottom:15px;">🏆 ВЫ ДОСТИГЛИ ЦЕЛЕЙ!</h2>
      
      <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:30px; margin:20px 0;">
        <p><strong>Инфляция:</strong> ${finalInfl.toFixed(1)}% ${currentScenario !== 'sandbox' ? `(цель ≤ ${s.targetInflation}%)` : ''}</p>
        <p><strong>Доступность жилья:</strong> ${finalHouse.toFixed(0)}/100 ${currentScenario !== 'sandbox' ? `(цель ≥ ${s.targetHousing})` : ''}</p>
        <p><strong>Цена квартиры:</strong> ${finalPrice.toFixed(1)} млн ₽</p>
        <p><strong>Доход семьи:</strong> ${finalIncome.toFixed(0)} тыс. ₽/мес</p>
        <p><strong>Лет накоплений:</strong> ${years.toFixed(1)} ${pluralizeYears(years)}</p>
      </div>
      
      <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:30px; margin:20px 0;">
        <p style="font-weight:bold; color:#ffd966;">🧠 РАЗБОР МИФА:</p>
        <p>${mythAnalysis}</p>
      </div>
      
      <p style="font-style:italic; margin:20px 0;">
        "Ключевая ставка — не волшебная кнопка. Важна реальная ставка, инфляция и доходы."
      </p>
      
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
        <button class="modal-btn" onclick="closeResultAndOpenMenu()">📜 Другой сценарий</button>
        <button class="modal-btn" onclick="closeResultAndRestart()">🔄 Повторить</button>
      </div>
    `;
  } else {
    // ПОРАЖЕНИЕ
    let lossMessage = '';
    if (lossReason === 'доверие') {
      lossMessage = 'Доверие упало до критического уровня. Общество и бизнес недовольны вашей политикой. Вы нелегитимны.';
    } else if (lossReason === 'инфляция') {
      lossMessage = 'Инфляция вышла из-под контроля. Цены растут быстрее доходов, жильё становится недоступным.';
    } else if (lossReason === 'жилье') {
      lossMessage = 'Доступность жилья осталась низкой. Ваша политика не принесла результатов.';
    } else {
      lossMessage = 'Вы не достигли поставленных целей. Попробуйте другую стратегию.';
    }
    
    resultHtml = `
      <h2 class="neutral" style="margin-bottom:15px;">🎓 ЭКСПЕРИМЕНТ ЗАВЕРШЁН</h2>
      
      <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:30px; margin:20px 0;">
        <p><strong>Инфляция:</strong> ${finalInfl.toFixed(1)}% (цель ≤ ${s.targetInflation}%)</p>
        <p><strong>Доступность жилья:</strong> ${finalHouse.toFixed(0)}/100 (цель ≥ ${s.targetHousing})</p>
        <p><strong>Цена квартиры:</strong> ${finalPrice.toFixed(1)} млн ₽</p>
        <p><strong>Доход семьи:</strong> ${finalIncome.toFixed(0)} тыс. ₽/мес</p>
        <p><strong>Лет накоплений:</strong> ${years.toFixed(1)} ${pluralizeYears(years)}</p>
      </div>
      
      <div style="background:rgba(255,100,100,0.2); padding:20px; border-radius:30px; margin:20px 0; border-left: 4px solid #ff6b4a;">
        <p style="font-weight:bold; color:#ff6b4a;">❌ ЦЕЛИ НЕ ДОСТИГНУТЫ</p>
        <p>${lossMessage}</p>
      </div>
      
      <p style="font-style:italic; margin:20px 0;">
        "Ключевая ставка — важный, но не единственный инструмент. Нужен комплексный подход."
      </p>
      
      <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
        <button class="modal-btn" onclick="closeResultAndOpenMenu()">📜 Другой сценарий</button>
        <button class="modal-btn" onclick="closeResultAndRestart()">🔄 Повторить попытку</button>
      </div>
    `;
  }
  
  document.getElementById('resultContent').innerHTML = resultHtml;
  document.getElementById('resultModal').style.display = 'flex';
  playVoice(20);
}

function showTrustLossModal() {
  const s = scenarios[currentScenario];
  const finalPrice = gameState.apartmentPrice[currentMeeting];
  const finalIncome = gameState.income[currentMeeting];
  const years = finalPrice * 1000 / finalIncome / 12;
  
  const lossHtml = `
    <h2 class="neutral" style="margin-bottom:15px;">📉 ДОВЕРИЕ УТРАЧЕНО</h2>
    
    <div style="background:rgba(0,0,0,0.3); padding:20px; border-radius:30px; margin:20px 0;">
      <p style="font-size: 18px; margin-bottom: 15px;">
        Доверие упало до критического уровня (<strong>${gameState.trust[currentMeeting].toFixed(0)}%</strong>)
      </p>
      <p style="font-size: 16px; line-height: 1.5;">
        Общество и бизнес недовольны вашей политикой. Вы нелегитимны как председатель Центрального банка.
      </p>
    </div>
    
    <div style="background:rgba(255,215,0,0.1); padding:20px; border-radius:30px; margin:20px 0;">
      <p style="font-weight:bold; color:#ffd966; margin-bottom:10px;">🧠 ПОЧЕМУ ЭТО ПРОИЗОШЛО:</p>
      <p style="font-size: 14px;">• Слишком резкие изменения ставки</p>
      <p style="font-size: 14px;">• Неспособность контролировать инфляцию</p>
      <p style="font-size: 14px;">• Игнорирование потребностей населения</p>
    </div>
    
    <p style="font-style:italic; margin:20px 0; font-size:14px;">
      "Доверие — самый хрупкий ресурс в экономике. Оно строится годами и рушится за мгновение."
    </p>
    
    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
      <button class="modal-btn" onclick="closeResultAndOpenMenu()">📜 Другой сценарий</button>
      <button class="modal-btn" onclick="closeResultAndRestart()">🔄 Повторить</button>
    </div>
  `;
  
  document.getElementById('resultContent').innerHTML = lossHtml;
  document.getElementById('resultModal').style.display = 'flex';
  playVoice(16); // голос о критическом доверии
}



function showTerm(term) {
  const t = dictionary[term];
  document.getElementById('termTitle').textContent = t.title;
  document.getElementById('termText').textContent = t.text;
  document.getElementById('termModal').style.display = 'flex';
}

function closeTermModal() {
  document.getElementById('termModal').style.display = 'none';
}

function showHelp() {
  document.getElementById('helpModal').style.display = 'flex';
  playSound('soundButton', 'button');
}

function closeHelp() {
  document.getElementById('helpModal').style.display = 'none';
}

function closeResultAndOpenMenu() {
  document.getElementById('resultModal').style.display = 'none';
  openScenarioMenu(); // открываем меню выбора сценария
}

function closeResultAndRestart() {
  document.getElementById('resultModal').style.display = 'none';
  restartScenario(); // перезапускаем текущий сценарий
}

function restartScenario() {
  playSound('soundButton', 'button');
  loadScenario(currentScenario);
}

// ===== ФОН =====
function createBg() {
  const bg = document.getElementById('currencyBg');
  const symbols = ['₽', '$', '€', '£', '¥', '₿', '₴', '₸', '₾', '₼', '₪', '₩', '₫', '฿', '₵'];
  bg.innerHTML = '';
  for (let i = 0; i < 90; i++) {
    const el = document.createElement('div');
    el.className = 'currency-symbol';
    el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.top = Math.random() * 100 + '%';
    el.style.fontSize = (30 + Math.random() * 60) + 'px';
    el.style.animationDelay = Math.random() * 15 + 's';
    el.style.animationDuration = (15 + Math.random() * 30) + 's';
    bg.appendChild(el);
  }
}

window.onload = function() {
  createBg();
  loadStyle();
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
  loadScenario('russia26'); // начинаем с 2000 года (более лёгкий)

  document.getElementById('keyRateSlider').addEventListener('input', function(e) {
    document.getElementById('rateDisplay').textContent = e.target.value + '%';
    updateForecast();
  });
  
  document.getElementById('keyRateSlider').addEventListener('change', function() {
    playSound('soundSlider', 'slider');
  });

  document.getElementById('applyBtn').addEventListener('click', applyDecision);
};

window.onclick = function(event) {
  const modals = [
    'termModal', 'eventModal', 'whatIfModal', 
    'termDefinitionModal', 'scenarioModal', 'helpModal', 'resultModal'
  ];
  
  modals.forEach(id => {
    const modal = document.getElementById(id);
    if (modal && event.target == modal) {
      modal.style.display = "none";
    }
  });
};