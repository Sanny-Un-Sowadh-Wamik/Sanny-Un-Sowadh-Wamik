/**
 * main.js — Portfolio Application Logic
 * =======================================
 * Author : Sanny Un Sowadh Wamik
 * Site   : WAMIK.DATA — Data Scientist Portfolio
 *
 * Responsibilities:
 *  - Slide navigation (next / prev / goToSlide)
 *  - Keyboard, touch swipe, and mouse-wheel controls
 *  - Entry / exit animation class management
 *  - Staggered content item reveal (.anim-item)
 *  - Skill bar width animations
 *  - Nav dot build & sync
 *  - Language toggle (JP / EN)
 *  - Ambient effect spawners (matrix rain, particles, hex rings)
 *  - Responsive video source swap (mobile vs desktop)
 */

'use strict';

/* ─────────────────────────────────────────────────
   CONSTANTS & STATE
   ───────────────────────────────────────────────── */

/** Total number of slides */
const TOTAL_SLIDES = 7;

/** Index of the interactive Data Lab slide (special: scroll/swipe nav disabled) */
const LAB_SLIDE = 5;

/** Currently active slide index */
let currentSlide = 0;

/** Prevents rapid slide changes mid-transition */
let isTransitioning = false;

/** Active language: 'jp' | 'en' */
let currentLang = 'jp';

/** Nav-dot tooltip labels per language */
const DOT_LABELS = {
  jp: ['ホーム', '自己紹介', 'スキル', '主要作品', '全作品', 'データラボ', '連絡先'],
  en: ['Home',   'About',    'Skills', 'Featured',  'All Works', 'Data Lab', 'Contact'],
};

/** Video sources for home-page background  */
const VIDEO_SOURCES = {
  mobile:  'src/hero-mobile.mov',   // Shown on screens ≤ 768px
  desktop: 'src/hero-desktop.mov',  // Shown on wider screens
};


/* ─────────────────────────────────────────────────
   INITIALISATION
   ───────────────────────────────────────────────── */

window.addEventListener('load', () => {
  // Spawn ambient visual effects
  createMatrix();
  createParticles();
  createHexPulses();

  // Build right-side nav dots
  buildNavDots();

  // Trigger entry animations on the first slide
  activateSlideItems(document.querySelectorAll('.slide')[0]);

  // Hide the loading screen after a short delay
  setTimeout(() => document.getElementById('loader').classList.add('hidden'), 900);

  // Set the correct hero video source based on screen width
  initVideoSource();
});


/* ─────────────────────────────────────────────────
   HERO VIDEO — RESPONSIVE SOURCE SWAP
   Serves a different .mov file on mobile vs desktop
   ───────────────────────────────────────────────── */

function initVideoSource() {
  const video = document.getElementById('heroBgVideo');
  if (!video) return;

  const mq = window.matchMedia('(max-width: 768px)');

  /** Apply the correct src and (re)start playback */
  function applySource() {
    const desired = mq.matches ? VIDEO_SOURCES.mobile : VIDEO_SOURCES.desktop;

    // Only reload if the source actually changed
    if (video.getAttribute('src') !== desired) {
      video.src = desired;
      video.load();
      video.play().catch(() => {/* Autoplay blocked — muted so should be fine */});
    }
  }

  applySource();

  // Re-evaluate when crossing the 768px breakpoint (e.g. rotation, devtools resize)
  mq.addEventListener('change', applySource);
}


/* ─────────────────────────────────────────────────
   AMBIENT EFFECTS
   ───────────────────────────────────────────────── */

/**
 * Creates CSS-animated matrix rain columns in #matrixRain.
 * Characters include binary digits, katakana, and data terms.
 */
function createMatrix() {
  const container = document.getElementById('matrixRain');
  const CHARS     = '01アイウエオカキクケコサシスセソデータ分析学習予測';

  for (let i = 0; i < 18; i++) {
    const col = document.createElement('div');
    col.className = 'matrix-col';

    // Build a random string of characters for this column
    let text = '';
    for (let j = 0; j < 20; j++) {
      text += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    col.textContent = text;

    Object.assign(col.style, {
      left:              Math.random() * 100 + '%',
      animationDuration: (Math.random() * 6 + 4) + 's',
      animationDelay:    (Math.random() * 8) + 's',
      fontSize:          (Math.random() * 4 + 10) + 'px',
    });

    container.appendChild(col);
  }
}

/**
 * Creates small glowing particle squares in #particles.
 * Coloured cyan or blood-red to match the theme.
 */
function createParticles() {
  const container = document.getElementById('particles');

  for (let i = 0; i < 20; i++) {
    const el   = document.createElement('div');
    el.className = 'particle';

    const size    = Math.random() * 2 + 1;
    const isRed   = Math.random() > 0.5;
    const rgb     = isRed ? '204,0,0' : '0,240,255';
    const opacity = Math.random() * 0.5 + 0.3;

    Object.assign(el.style, {
      width:             size + 'px',
      height:            size + 'px',
      left:              Math.random() * 100 + '%',
      borderRadius:      '1px',
      background:        `rgba(${rgb},${opacity})`,
      boxShadow:         `0 0 ${size * 4}px rgba(${rgb},0.4)`,
      animationDuration: (Math.random() * 8 + 6) + 's',
      animationDelay:    (Math.random() * 10) + 's',
    });

    container.appendChild(el);
  }
}

/**
 * Creates pulsing hex-ring circles in #hexPulse.
 * Alternate between cyan and blood-red border colours.
 */
function createHexPulses() {
  const container = document.getElementById('hexPulse');

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.className = 'hex-ring';

    const size = Math.random() * 60 + 40;

    Object.assign(ring.style, {
      width:             size + 'px',
      height:            size + 'px',
      left:              Math.random() * 80 + 10 + '%',
      top:               Math.random() * 80 + 10 + '%',
      animationDuration: (Math.random() * 4 + 4) + 's',
      animationDelay:    (Math.random() * 6) + 's',
      borderColor:       Math.random() > 0.5 ? 'var(--cyan-dim)' : 'var(--neon-green-dim)',
    });

    container.appendChild(ring);
  }
}


/* ─────────────────────────────────────────────────
   NAV DOTS
   ───────────────────────────────────────────────── */

/** Build (or rebuild) the hexagonal side-nav dots with current language labels */
function buildNavDots() {
  const container = document.getElementById('navDots');
  container.innerHTML = '';

  const labels = DOT_LABELS[currentLang];

  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const dot = document.createElement('div');
    dot.className = 'nav-dot' + (i === currentSlide ? ' active' : '');
    dot.onclick = () => goToSlide(i);

    // Tooltip label shown on hover
    const label       = document.createElement('span');
    label.className   = 'nav-dot-label';
    label.textContent = labels[i];

    dot.appendChild(label);
    container.appendChild(dot);
  }
}

/** Sync active dot highlight and slide counter without rebuilding all dots */
function updateNavDots() {
  document.querySelectorAll('.nav-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });

  document.getElementById('counterCurrent').textContent =
    String(currentSlide + 1).padStart(2, '0');
}


/* ─────────────────────────────────────────────────
   SLIDE ITEM ANIMATIONS
   ───────────────────────────────────────────────── */

/**
 * Trigger staggered entry animation for all .anim-item elements in a slide.
 * Also resets and re-animates skill bars.
 * @param {Element} slide
 */
function activateSlideItems(slide) {
  const items = slide.querySelectorAll('.anim-item');

  items.forEach((el, i) => {
    el.classList.remove('visible');
    el.style.transitionDelay = (0.12 * (i + 1)) + 's';
    void el.offsetWidth; // Force reflow to restart animation
    el.classList.add('visible');
  });

  // Skill bars: reset to 0, then animate to their data-w value
  slide.querySelectorAll('.skill-bar-fill').forEach(bar => {
    bar.style.width = '0';
    void bar.offsetWidth;
    bar.style.width = bar.getAttribute('data-w') || '0';
  });

  // Animate any count-up numbers (stats, skill percentages)
  runCountUps(slide);

  // Let the interactive Data Lab know which slide is now on screen
  // (it resizes / pauses its canvases accordingly)
  if (window.DataLab) window.DataLab.onSlideShown(slide);
}

/**
 * Animate every [data-countup] element inside a slide from 0 to its target.
 * Target is taken from data-cu-target (+ optional data-cu-suffix) if present,
 * otherwise parsed from the element's text (e.g. "16", "7+", "95%").
 * @param {Element} slide
 */
function runCountUps(slide) {
  slide.querySelectorAll('[data-countup]').forEach(el => {
    let target, suffix;

    if (el.dataset.cuTarget !== undefined) {
      target = parseFloat(el.dataset.cuTarget) || 0;
      suffix = el.dataset.cuSuffix || '';
    } else {
      const m = String(el.textContent).trim().match(/^(\d+(?:\.\d+)?)(.*)$/);
      target = m ? parseFloat(m[1]) : 0;
      suffix = m ? m[2] : '';
      el.dataset.cuTarget = String(target);   // Cache so re-runs stay stable
      el.dataset.cuSuffix = suffix;
    }

    const isInt = Number.isInteger(target);
    const dur   = 1200;
    const t0    = performance.now();
    // Token guards against overlapping animations on rapid re-entry
    const token = (el._cuToken = (el._cuToken || 0) + 1);

    function tick(now) {
      if (el._cuToken !== token) return;            // Superseded by a newer run
      const p     = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      const val   = target * eased;
      el.textContent = (isInt ? Math.round(val) : val.toFixed(2)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (isInt ? target : target.toFixed(2)) + suffix;
    }
    requestAnimationFrame(tick);
  });
}

/**
 * Remove all visible states from a slide's animated items.
 * Called before a slide exits so entering slide starts fresh.
 * @param {Element} slide
 */
function deactivateSlideItems(slide) {
  slide.querySelectorAll('.anim-item').forEach(el => {
    el.classList.remove('visible');
    el.style.transitionDelay = '0s';
  });

  slide.querySelectorAll('.skill-bar-fill').forEach(bar => {
    bar.style.width = '0';
  });
}


/* ─────────────────────────────────────────────────
   SLIDE NAVIGATION
   ───────────────────────────────────────────────── */

/**
 * Navigate to slide n with a directional slide animation.
 * @param {number} n - Target slide index (0-based)
 */
function goToSlide(n) {
  // Guard: already transitioning, same slide, or out of bounds
  if (isTransitioning || n === currentSlide || n < 0 || n >= TOTAL_SLIDES) return;

  isTransitioning = true;

  const direction = n > currentSlide ? 'right' : 'left';
  const slides    = document.querySelectorAll('.slide');
  const outSlide  = slides[currentSlide];
  const inSlide   = slides[n];

  // Trigger the red/cyan glitch slash overlay
  const blade = document.getElementById('slashBlade');
  blade.classList.remove('animate');
  void blade.offsetWidth; // Force reflow to restart animation
  blade.classList.add('animate');

  // Exit current slide
  deactivateSlideItems(outSlide);
  outSlide.classList.remove('active');
  outSlide.classList.add(direction === 'right' ? 'exit-right' : 'exit-left');

  // After the exit animation completes, bring in the new slide
  setTimeout(() => {
    outSlide.classList.remove('exit-right', 'exit-left');

    inSlide.classList.add('active', direction === 'right' ? 'enter-right' : 'enter-left');
    activateSlideItems(inSlide);

    currentSlide = n;
    updateNavDots();

    // The Data Lab is an interactive zone: flag it on <body> so the CSS can hide
    // the edge nav-arrows (they overlap the canvas) and so wheel/swipe slide
    // navigation is suppressed while the user is clicking/dragging inside it.
    document.body.classList.toggle('lab-active', n === LAB_SLIDE);

    // Clean up entry animation class
    setTimeout(() => {
      inSlide.classList.remove('enter-right', 'enter-left');
      isTransitioning = false;
    }, 700);
  }, 250);
}

/** Navigate to next slide (wraps at end) */
function nextSlide() { goToSlide(currentSlide + 1); }

/** Navigate to previous slide (wraps at start) */
function prevSlide() { goToSlide(currentSlide - 1); }

// Expose for inline onclick attributes in HTML
window.goToSlide = goToSlide;
window.nextSlide = nextSlide;
window.prevSlide = prevSlide;


/* ─────────────────────────────────────────────────
   INPUT HANDLERS
   ───────────────────────────────────────────────── */

/* ── Keyboard ── */
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  nextSlide();
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    prevSlide();
});

/* ── Touch Swipe ── */
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

document.addEventListener('touchend', e => {
  // On the interactive Data Lab, let taps/drags reach the canvas & controls
  // instead of swiping to another slide. Leave via nav dots or arrow keys.
  if (document.body.classList.contains('lab-active')) return;
  if (isTransitioning) return;   // ignore swipes mid-transition (no skipping)

  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;

  // Require a clear, deliberate swipe (and ignore tiny/scroll-ish drags)
  const THRESHOLD = 60;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < THRESHOLD) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    dx < 0 ? nextSlide() : prevSlide();   // horizontal swipe
  } else {
    dy < 0 ? nextSlide() : prevSlide();   // vertical swipe
  }
}, { passive: true });

/* ── Mouse Wheel / Trackpad ──
   One decisive scroll = one slide. We accumulate delta to a threshold then
   lock for the length of a transition, so inertial trackpad scrolling can't
   skip several slides at once (the old behaviour that felt twitchy). */
let wheelLock = false;
let wheelAccum = 0;
let wheelIdle;
document.addEventListener('wheel', e => {
  if (document.body.classList.contains('lab-active')) return;  // Lab scrolls freely
  if (isTransitioning || wheelLock) return;

  wheelAccum += e.deltaY;

  // If the user pauses, forget the partial scroll so old drift can't trigger.
  clearTimeout(wheelIdle);
  wheelIdle = setTimeout(() => { wheelAccum = 0; }, 160);

  if (Math.abs(wheelAccum) < 45) return;   // needs a deliberate push

  const dir = wheelAccum > 0 ? 1 : -1;
  wheelAccum = 0;
  wheelLock = true;
  setTimeout(() => { wheelLock = false; }, 850);   // cool-down ≈ one transition

  dir > 0 ? nextSlide() : prevSlide();
}, { passive: true });


/* ─────────────────────────────────────────────────
   LANGUAGE TOGGLE
   Switches between Japanese (jp) and English (en)
   ───────────────────────────────────────────────── */

/**
 * Update all [data-jp] / [data-en] elements and rebuild UI for new language.
 * @param {'jp'|'en'} lang
 */
function setLang(lang) {
  currentLang = lang;

  // Update lang-btn active state
  document.getElementById('langJP').classList.toggle('active', lang === 'jp');
  document.getElementById('langEN').classList.toggle('active', lang === 'en');

  // Update <html lang> attribute for accessibility / SEO
  document.documentElement.lang = lang === 'jp' ? 'ja' : 'en';

  // Update hero kanji / DATA SCIENCE watermark
  document.getElementById('heroKanji').textContent =
    lang === 'jp' ? 'データ科学' : 'DATA SCIENCE';

  // Replace text content on all localised elements
  document.querySelectorAll('[data-jp][data-en]').forEach(el => {
    el.textContent = el.getAttribute(lang === 'jp' ? 'data-jp' : 'data-en');
  });

  // Rebuild nav dots with new language labels
  buildNavDots();
}

// Expose for inline onclick attributes in HTML
window.setLang = setLang;
