// ===== УРОВНИ ГРОМКОСТИ =====
const soundLevels = {
  bgMusic: 0.15,
  button: 0.4,
  bell: 0.5,
  ovation: 0.6,
  noise: 0.6,
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

// ===== НАВИГАЦИЯ =====
function startGame() {
  playSound('soundBell', 'bell');
  window.location.href = 'tutorial.html';
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
    
    if (!wasHidden && bubble.classList.contains('hidden')) {
      if (img) img.classList.add('glow');
    }
    
    if (wasHidden && !bubble.classList.contains('hidden')) {
      if (img) img.classList.remove('glow');
    }
  }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function resetSkipModal() {
  document.querySelectorAll('input[name="q1"], input[name="q2"], input[name="q3"]').forEach(radio => {
    radio.checked = false;
  });
  document.getElementById('skipResult').innerHTML = '';
}

function openSkipModal() {
  resetSkipModal();
  document.getElementById('skipModal').style.display = 'flex';
  playSound('soundButton', 'button');
}

function closeSkipModal() {
  document.getElementById('skipModal').style.display = 'none';
  resetSkipModal();
}

function checkSkipAnswers() {
  const q1 = document.querySelector('input[name="q1"]:checked');
  const q2 = document.querySelector('input[name="q2"]:checked');
  const q3 = document.querySelector('input[name="q3"]:checked');
  
  if (!q1 || !q2 || !q3) {
    document.getElementById('skipResult').innerHTML = '❓ Ответьте на все вопросы';
    playSound('soundButton', 'button');
    return;
  }
  
  const correct = (q1.value === 'up' && q2.value === 'minus' && q3.value === 'all');
  
  if (correct) {
    document.getElementById('skipResult').innerHTML = '✅ Верно! Переходим к игре...';
    playSound('soundBell', 'bell');
    setTimeout(() => {
      window.location.href = 'style.html';
    }, 1000);
  } else {
    document.getElementById('skipResult').innerHTML = '❌ Не все ответы верны. Рекомендуем пройти обучение.';
    playSound('soundButton', 'button');
    
    // ===== ДОБАВЛЯЕМ КНОПКУ ОБУЧЕНИЯ =====
    // Проверяем, есть ли уже кнопка, чтобы не дублировать
    if (!document.getElementById('tutorialBtn')) {
      const modalFooter = document.querySelector('.modal-footer');
      
      // Создаем кнопку
      const tutorialBtn = document.createElement('button');
      tutorialBtn.id = 'tutorialBtn';
      tutorialBtn.className = 'modal-btn';
      tutorialBtn.style.marginTop = '10px';
      tutorialBtn.style.backgroundColor = '#4caf50';
      tutorialBtn.textContent = '📚 Пройти обучение';
      
      // Добавляем обработчик
      tutorialBtn.onclick = function() {
        playSound('soundButton', 'button');
        window.location.href = 'tutorial.html';
      };
      
      // Вставляем после результата
      const skipResult = document.getElementById('skipResult');
      skipResult.appendChild(tutorialBtn);
    }
  }
}

// Принудительный пропуск обучения
function forceSkip() {
  playSound('soundButton', 'button');
  window.location.href = 'style.html'; // переход сразу к выбору стиля
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
  const savedTheme = localStorage.getItem('theme') || 'dark';
  setTheme(savedTheme);
};
