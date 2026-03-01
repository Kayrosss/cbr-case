// ===== УРОВНИ ГРОМКОСТИ =====
const soundLevels = {
  bgMusic: 0.15,
  button: 0.4,
  bell: 0.5,
  default: 0.5
};

let soundEnabled = true;
let musicEnabled = true;
let volume = 50;
let audioInitialized = false;

// Разблокировка аудио
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

// Закрытие меню при клике вне
document.addEventListener('click', function(e) {
  const menu = document.getElementById('settingsMenu');
  const btn = document.querySelector('.panel-settings');
  if (!btn.contains(e.target) && !menu.contains(e.target) && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// Закрытие меню при скролле
window.addEventListener('scroll', function() {
  const menu = document.getElementById('settingsMenu');
  if (menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

// ===== УПРАВЛЕНИЕ ЗВУКОМ =====
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

function toggleSound() {
  soundEnabled = document.getElementById('soundToggle').checked;
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
    
    // Если облачко было открыто, а теперь закрылось
    if (!wasHidden && bubble.classList.contains('hidden')) {
      if (img) img.classList.add('glow');
    }
    
    // Если облачко было закрыто, а теперь открылось
    if (wasHidden && !bubble.classList.contains('hidden')) {
      if (img) img.classList.remove('glow');
    }
  }
}

// ===== СТИЛИ УПРАВЛЕНИЯ =====
const leadershipStyles = [
  {
    id: 'conservative',
    name: 'Консерватор',
    icon: '🛡️',
    description: 'Осторожные решения, высокое доверие, но бизнес развивается медленнее',
    trustBonus: 15,
    businessModifier: 0.7,
    inflationResistance: 10,
    color: '#36a2eb'
  },
  {
    id: 'reformer',
    name: 'Реформатор',
    icon: '⚡',
    description: 'Рисковые решения, бизнес растёт быстро, но доверие нестабильно',
    trustBonus: -10,
    businessModifier: 1.4,
    inflationResistance: -5,
    color: '#ff6b4a'
  },
  {
    id: 'populist',
    name: 'Народный лидер',
    icon: '❤️',
    description: 'Вас любят, доверие высокое, но экономика страдает от популизма',
    trustBonus: 20,
    businessModifier: 0.5,
    inflationResistance: -10,
    color: '#4caf50'
  },
  {
    id: 'technocrat',
    name: 'Технократ',
    icon: '⚙️',
    description: 'Рациональные решения, баланс доверия и бизнеса',
    trustBonus: 5,
    businessModifier: 1.0,
    inflationResistance: 5,
    color: '#ffd966'
  }
];

let selectedStyle = null;

// Отрисовка карточек
function renderStyles() {
  const grid = document.getElementById('stylesGrid');
  grid.innerHTML = '';

  leadershipStyles.forEach(style => {
    const card = document.createElement('div');
    card.className = 'style-card';
    card.onclick = () => {
      playSound('soundButton', 'button');
      selectStyle(style.id);
    };

    card.innerHTML = `
      <div class="style-icon">${style.icon}</div>
      <div class="style-name" style="color: ${style.color}">${style.name}</div>
      <div class="style-desc">${style.description}</div>
      <div class="style-effects">
        <div class="effect-item">
          <span class="effect-label">⭐ Доверие граждан:</span>
          <span class="effect-value ${style.trustBonus >= 0 ? 'positive' : 'negative'}">
            ${style.trustBonus >= 0 ? '+' : ''}${style.trustBonus}%
          </span>
        </div>
        <div class="effect-item">
          <span class="effect-label">📈 Развитие бизнеса:</span>
          <span class="effect-value ${style.businessModifier >= 1 ? 'positive' : 'negative'}">
            x${style.businessModifier}
          </span>
        </div>
        <div class="effect-item">
          <span class="effect-label">🛡️ Устойчивость к инфляции:</span>
          <span class="effect-value ${style.inflationResistance >= 0 ? 'positive' : 'negative'}">
            ${style.inflationResistance >= 0 ? '+' : ''}${style.inflationResistance}%
          </span>
        </div>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Выбор стиля
function selectStyle(styleId) {
  selectedStyle = styleId;
  
  document.querySelectorAll('.style-card').forEach((card, index) => {
    if (leadershipStyles[index].id === styleId) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const startBtn = document.getElementById('startBtn');
  startBtn.classList.remove('disabled');
}

// Старт игры
function startGame() {
  if (!selectedStyle) return;
  
  playSound('soundBell', 'bell');
  localStorage.setItem('leadershipStyle', selectedStyle);
  window.location.href = 'scenario.html';
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

// ===== ЗАГРУЗКА =====
window.onload = function() {
  createBg();
  renderStyles();
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
};