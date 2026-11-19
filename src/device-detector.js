/*
 * Определение типа устройства и переключение между мобильной и десктопной версией.
 *
 * Логика:
 *  - Проверяем localStorage 'teacherDiaryV3.forcedVersion' — если там 'mobile' или 'desktop',
 *    принудительно используем эту версию (пользователь явно выбрал).
 *  - Иначе определяем устройство по признакам браузера:
 *      * ширина экрана <= 768px (или <= 1024px с сенсором) → мобильное
 *      * UserAgent содержит Mobile/Android/iPhone/iPad/iPod/BlackBerry/Windows Phone → мобильное
 *      * 'ontouchstart' в document → сенсорное устройство
 *  - Результат кэшируем в localStorage 'teacherDiaryV3.detectedDevice' для стабильности.
 */

const DEVICE_KEY = 'teacherDiaryV3.forcedVersion';
const DETECTED_KEY = 'teacherDiaryV3.detectedDevice';

function isMobileUserAgent() {
  const ua = navigator.userAgent || '';
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone|Mobile Safari|Mobi/i.test(ua);
}

function isTouchDevice() {
  return ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);
}

function detectDevice() {
  // Явный выбор пользователя
  try {
    const forced = localStorage.getItem(DEVICE_KEY);
    if (forced === 'mobile' || forced === 'desktop') return forced;
  } catch (e) {}

  // Кэш последнего определения (чтобы не прыгать между версиями при изменении ориентации)
  try {
    const cached = localStorage.getItem(DETECTED_KEY);
    if (cached === 'mobile' || cached === 'desktop') return cached;
  } catch (e) {}

  const w = window.innerWidth || document.documentElement.clientWidth || 0;
  const h = window.innerHeight || document.documentElement.clientHeight || 0;
  const minDim = Math.min(w, h);
  const uaMobile = isMobileUserAgent();
  const touch = isTouchDevice();

  let detected;
  if (uaMobile || (touch && minDim <= 1024) || (!touch && minDim <= 480)) {
    detected = 'mobile';
  } else {
    detected = 'desktop';
  }

  try { localStorage.setItem(DETECTED_KEY, detected); } catch (e) {}
  return detected;
}

function forceVersion(v) {
  if (v !== 'mobile' && v !== 'desktop') {
    try { localStorage.removeItem(DEVICE_KEY); } catch (e) {}
  } else {
    try { localStorage.setItem(DEVICE_KEY, v); } catch (e) {}
  }
  window.location.reload();
}

function setMobileVersion(){
  if (location.pathname.indexOf('/mobile/') !== -1) {
    window.location.reload();
    return;
  }
  window.location.href = 'mobile/index.html?forced=mobile';
}

function currentVersion() {
  return detectDevice();
}