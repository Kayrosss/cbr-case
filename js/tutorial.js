// ===== УРОВНИ ГРОМКОСТИ =====
const soundLevels = {
  bgMusic: 0.15,
  button: 0.4,
  bell: 0.5,
  cash: 0.5,
  transition: 0.4,
  slider: 0.3,
  victory: 0.6,
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
      if (music) {
        music.volume = volume / 100 * soundLevels.bgMusic;
        music.play().catch(e => {});
      }
    }
    document.body.removeEventListener('click', initAudio);
  }
}, { once: true });

function playSound(id, type = 'default') {
  if (!soundEnabled) return;
  const sound = document.getElementById(id);
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
function toggleSound() {
  soundEnabled = !soundEnabled;
  document.getElementById('soundToggle').classList.toggle('on', soundEnabled);
  playSound('soundButton', 'button');
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  document.getElementById('musicToggle').classList.toggle('on', musicEnabled);
  const music = document.getElementById('bgMusic');
  if (musicEnabled) {
    music.volume = volume / 100 * soundLevels.bgMusic;
    music.play().catch(e => {});
  } else {
    music.pause();
  }
  playSound('soundButton', 'button');
}

function changeVolume(val) {
  volume = val;
  const music = document.getElementById('bgMusic');
  if (musicEnabled && music) {
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

// ===== НАВИГАЦИЯ МЕЖДУ СТРАНИЦАМИ =====
function goToHome() {
  playSound('soundButton', 'button');
  window.location.href = 'index.html';
}

// ===== ПОЛЗУНКИ ИЗ ПЕРВОГО ЭТАПА =====
document.addEventListener('DOMContentLoaded', function() {
  // ШАГ 2: Ползунок ключевой ставки
  const step2Slider = document.getElementById('step2_slider');
  if (step2Slider) {
    step2Slider.addEventListener('input', function(e) {
      const val = e.target.value;
      document.getElementById('step2_rate').textContent = val + '%';
      document.getElementById('step2_mortgage').textContent = (parseFloat(val) + 3).toFixed(1) + '%';
      document.getElementById('step2_business').textContent = (parseFloat(val) + 1).toFixed(1) + '%';
      if (val < 5) document.getElementById('step2_effect').innerHTML = '⚠️ Слишком низкая — риск инфляции';
      else if (val > 15) document.getElementById('step2_effect').innerHTML = '⚠️ Слишком высокая — экономика замедляется';
      else document.getElementById('step2_effect').innerHTML = '✅ Оптимально';
    });
    step2Slider.addEventListener('change', function() { playSound('soundSlider', 'slider'); });
  }

  // ШАГ 3: Ползунок реальной ставки
  const step3Slider = document.getElementById('step3_slider');
  if (step3Slider) {
    step3Slider.addEventListener('input', function(e) {
      const rate = parseFloat(e.target.value);
      const inflation = 12;
      const real = (rate - inflation).toFixed(1);
      document.getElementById('step3_rate_display').textContent = rate + '%';
      document.getElementById('step3_rate').textContent = rate + '%';
      document.getElementById('step3_real').textContent = real + '%';
      const msg = document.getElementById('step3_message');
      if (real < -5) {
        msg.innerHTML = '<span style="color: #ff6b4a;">🔴 КРИТИЧНО! Реальная ставка ' + real + '%. Срочно поднимай ставку, иначе деньги сгорят!</span>';
      } else if (real < 0) {
        msg.innerHTML = '<span style="color: #ffaa00;">⚠️ Реальная ставка отрицательная: ' + real + '%. Деньги обесцениваются. Подними ставку выше инфляции.</span>';
      } else if (real <= 3) {
        msg.innerHTML = '<span style="color: #4caf50;">✅ ЗОЛОТАЯ СЕРЕДИНА! Реальная ставка ' + real + '%. Отличный баланс — деньги защищены, экономика растёт.</span>';
      } else if (real <= 7) {
        msg.innerHTML = '<span style="color: #36a2eb;">📊 Реальная ставка ' + real + '%. Выше среднего — можно немного снизить, чтобы стимулировать рост.</span>';
      } else {
        msg.innerHTML = '<span style="color: #ff6b4a;">🔴 СЛИШКОМ ВЫСОКАЯ! Реальная ставка ' + real + '%. Экономика может замедлиться. Лучше снизить ставку.</span>';
      }
    });
    step3Slider.addEventListener('change', function() { playSound('soundSlider', 'slider'); });
  }

  // ШАГ 6: Ползунок для практики
  const step6Slider = document.getElementById('slider6');
  if (step6Slider) {
    step6Slider.addEventListener('input', function(e) {
      const val = e.target.value;
      document.getElementById('rateDisplay6').textContent = val + '%';
      document.getElementById('practiceRate6').textContent = val + '%';
      const forecast = 12 - (val - 8) * 0.3;
      document.getElementById('forecast6').innerHTML = `🔮 Прогноз: инфляция может стать ${forecast.toFixed(1)}%`;
    });
    step6Slider.addEventListener('change', function() { playSound('soundSlider', 'slider'); });
  }

  // ШАГ 8: Ползунок для практики (знакомство)
const step8Slider = document.getElementById('slider8');
if (step8Slider) {
  step8Slider.addEventListener('input', function(e) {
    const val = e.target.value;
    document.getElementById('rateDisplay8').textContent = val + '%';
    document.getElementById('practiceRate8').textContent = val + '%';
    const forecast = 12 - (val - 8) * 0.3;
    document.getElementById('forecast8').innerHTML = `🔮 Прогноз: инфляция может стать ${forecast.toFixed(1)}%`;
  });
  step8Slider.addEventListener('change', function() { 
    playSound('soundSlider', 'slider'); 
  });
}

  // ШАГ 7: Ползунок для практики
  const step7Slider = document.getElementById('slider7');
  if (step7Slider) {
    step7Slider.addEventListener('input', function(e) {
      const val = e.target.value;
      document.getElementById('rateDisplay7').textContent = val + '%';
      document.getElementById('practiceRate7').textContent = val + '%';
      const real = (val - 12).toFixed(1);
      document.getElementById('realRate7').innerHTML = `Реальная: ${real}%`;
      const forecast = 12 - (val - 8) * 0.3;
      document.getElementById('forecast7').innerHTML = `🔮 Прогноз: инфляция может стать ${forecast.toFixed(1)}%`;
    });
    step7Slider.addEventListener('change', function() { playSound('soundSlider', 'slider'); });
  }

  // ШАГ 9: Ползунок для практики (борьба с отрицательной ставкой)
const step9Slider = document.getElementById('slider9');
if (step9Slider) {
  step9Slider.addEventListener('input', function(e) {
    const val = e.target.value;
    document.getElementById('rateDisplay9').textContent = val + '%';
    document.getElementById('practiceRate9').textContent = val + '%';
    const real = (val - 12).toFixed(1);
    document.getElementById('realRate9').innerHTML = `Реальная: ${real}%`;
    const forecast = 12 - (val - 8) * 0.3;
    document.getElementById('forecast9').innerHTML = `🔮 Прогноз: инфляция может стать ${forecast.toFixed(1)}%`;
  });
  step9Slider.addEventListener('change', function() { 
    playSound('soundSlider', 'slider'); 
  });
}

  // ШАГ 11: Ползунок для практики (стабильность)
const step11Slider = document.getElementById('slider11');
if (step11Slider) {
  step11Slider.addEventListener('input', function(e) {
    const val = e.target.value;
    document.getElementById('rateDisplay11').textContent = val + '%';
    const forecast = 9 - (val - 13) * 0.3;
    document.getElementById('forecast11').innerHTML = `🔮 Прогноз: инфляция может стать ${forecast.toFixed(1)}%`;
  });
  step11Slider.addEventListener('change', function() { 
    playSound('soundSlider', 'slider'); 
  });
}
});

// ===== ПРАКТИКА =====
let practiceStep9Completed = false;
let practiceStep11Completed = false;

function applyPractice(step) {
  playSound('soundCashRegister', 'cash');
  
  // ШАГ 8: Знакомство с интерфейсом
  if (step === 8) {
    document.getElementById('next8').classList.remove('disabled');
    document.getElementById('assistantMsg8').innerHTML = '✅ Отлично! Ты понял, как работает ползунок. Теперь можешь идти дальше.';
  }
  
  // ШАГ 9: Борьба с отрицательной ставкой
  if (step === 9) {
    const slider = document.getElementById('slider9');
    const rate = parseFloat(slider.value);
    
    if (rate >= 13) {
      document.getElementById('next9').classList.remove('disabled');
      document.getElementById('assistantMsg9').innerHTML = '✅ Молодец! Теперь реальная ставка положительная. Нажми «Далее», чтобы увидеть результат.';
      
      // Обновляем данные для следующего шага (шаг 10)
      document.getElementById('infl10').textContent = '10%';
      document.getElementById('rate10').textContent = rate + '%';
      const real = (rate - 10).toFixed(1);
      document.getElementById('real10').innerHTML = `Реальная: +${real}%`;
      document.getElementById('housing10').textContent = '47/100';
    } else {
      document.getElementById('assistantMsg9').innerHTML = '❌ Ставка слишком низкая. Подними её до 13% или выше, чтобы реальная ставка стала положительной.';
    }
  }
  
  // ШАГ 11: Стабильность
  if (step === 11) {
    const slider = document.getElementById('slider11');
    const rate = parseFloat(slider.value);
    
    if (rate >= 12 && rate <= 14) {
      document.getElementById('next11').classList.remove('disabled');
      document.getElementById('assistantMsg11').innerHTML = '✅ Отлично! Ты сохранил стабильность. Доступность жилья продолжает расти. Нажми «Далее».';
      
      // Обновляем данные для следующего шага (шаг 12)
      document.getElementById('infl12').textContent = '8%';
      document.getElementById('rate12').textContent = rate + '%';
      const real = (rate - 8).toFixed(1);
      document.getElementById('real12').innerHTML = `Реальная: +${real}%`;
      document.getElementById('housing12').textContent = '52/100';
      document.getElementById('gdp12').textContent = '+2.1%';
    } else {
      document.getElementById('assistantMsg11').innerHTML = '❌ Лучше оставить ставку на прежнем уровне (около 13%), чтобы не раскачивать экономику.';
    }
  }
}

// ===== НАВИГАЦИЯ =====
const totalSteps = 12;

function nextStep(step) {
  playSound('soundTransition', 'transition');
  document.getElementById(`step${step}`).style.display = 'none';
  document.getElementById(`step${step + 1}`).style.display = 'flex';
  document.getElementById('stepIndicator').textContent = `Шаг ${step + 1}/${totalSteps}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep(step) {
  playSound('soundTransition', 'transition');
  document.getElementById(`step${step}`).style.display = 'none';
  document.getElementById(`step${step - 1}`).style.display = 'flex';
  document.getElementById('stepIndicator').textContent = `Шаг ${step - 1}/${totalSteps}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function finishTutorial() {
  playSound('soundVictoryFanfare', 'victory');
  document.getElementById('completionModal').style.display = 'flex';
}

function goToStyle() {
  window.location.href = 'style.html';
}

function restartTutorial() {
  document.getElementById('completionModal').style.display = 'none';
  for (let i = 1; i <= totalSteps; i++) {
    const el = document.getElementById(`step${i}`);
    if (el) el.style.display = 'none';
  }
  document.getElementById('step1').style.display = 'flex';
  document.getElementById('stepIndicator').textContent = `Шаг 1/${totalSteps}`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
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