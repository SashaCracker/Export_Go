document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupLanguageSelector();
  applySavedLanguage();
  setupSmoothAnchors();
  setupActiveNavState();
  setupServiceFilters();
  setupServiceCollapsibles();
  setupPricingCollapsibles();
  setupCalculator();
});

function setupMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
  });
}

function setupActiveNavState() {
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list .nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.endsWith(here)) link.classList.add('active');
  });
}

function setupSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const targetId = a.getAttribute('href');
      if (!targetId || targetId === '#' || targetId.length === 1) return;
      const el = document.querySelector(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Language system
const LANG_KEY = 'export_go_lang';
const translations = { en: { 'nav.services': 'Services' } };

function setupLanguageSelector() {
  const btn = document.getElementById('language-btn');
  const dropdown = document.getElementById('language-dropdown');
  const current = document.getElementById('current-lang');
  if (!btn || !dropdown || !current) return;
  btn.addEventListener('click', () => dropdown.classList.toggle('active'));
  dropdown.querySelectorAll('.language-option').forEach(opt => {
    opt.addEventListener('click', e => {
      e.preventDefault();
      const lang = opt.getAttribute('data-lang') || 'en';
      localStorage.setItem(LANG_KEY, lang);
      current.textContent = lang.toUpperCase().slice(0, 2);
      translatePage(lang);
      dropdown.classList.remove('active');
    });
  });
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !btn.contains(e.target)) dropdown.classList.remove('active');
  });
}

function applySavedLanguage() {
  const saved = localStorage.getItem(LANG_KEY) || 'en';
  const current = document.getElementById('current-lang');
  if (current) current.textContent = saved.toUpperCase().slice(0, 2);
  translatePage(saved);
}

function translatePage(lang) {
  const dict = translations[lang] || translations.en;
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate') || '';
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
    const key = el.getAttribute('data-translate-placeholder') || '';
    if (dict[key] && 'placeholder' in el) el.placeholder = dict[key];
  });
}

// Services filters
function setupServiceFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.service-card');
  if (!buttons.length || !cards.length) return;
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      cards.forEach(card => {
        const cat = (card.getAttribute('data-category') || '').split(/\s+/);
        card.style.display = filter === 'all' || cat.includes(filter) ? '' : 'none';
      });
    });
  });
  const url = new URL(window.location.href);
  const param = url.searchParams.get('filter');
  if (param) {
    const target = Array.from(buttons).find(b => (b.getAttribute('data-filter') || '') === param);
    if (target) target.click();
  }
}

// Collapsibles
function setupServiceCollapsibles() {
  document.querySelectorAll('.service-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const key = toggle.getAttribute('data-service');
      const section = document.getElementById(`service-${key}`);
      if (!section) return;
      const isActive = section.classList.contains('active');
      section.classList.toggle('active');
      toggle.classList.toggle('active');
      if (!isActive) {
        document.querySelectorAll('.service-content.active').forEach(el => { if (el !== section) el.classList.remove('active'); });
        document.querySelectorAll('.service-toggle.active').forEach(t => { if (t !== toggle) t.classList.remove('active'); });
      }
    });
  });
}

function setupPricingCollapsibles() {
  document.querySelectorAll('.pricing-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const key = toggle.getAttribute('data-pricing');
      const section = document.getElementById(`pricing-${key}`);
      if (!section) return;
      const isActive = section.classList.contains('active');
      section.classList.toggle('active');
      toggle.classList.toggle('active');
      if (!isActive) {
        document.querySelectorAll('.pricing-content.active').forEach(el => { if (el !== section) el.classList.remove('active'); });
        document.querySelectorAll('.pricing-toggle.active').forEach(t => { if (t !== toggle) t.classList.remove('active'); });
      }
    });
  });
}

// Calculator based on calculator.html
function setupCalculator() {
  const price = document.getElementById('product-price');
  const qty = document.getElementById('quantity');
  const cif = document.getElementById('cif');
  const dutyPct = document.getElementById('duty-percent');
  const vatPct = document.getElementById('vat-percent');
  const calcBtn = document.getElementById('calculate-btn');
  const resetBtn = document.getElementById('reset-btn');
  if (!price || !qty || !cif || !dutyPct || !vatPct) return;

  const outBase = document.getElementById('base-cost');
  const outCif = document.getElementById('cif-cost');
  const outDuty = document.getElementById('duty-cost');
  const outVat = document.getElementById('vat-cost');
  const outTotal = document.getElementById('total-cost');
  const outPerUnit = document.getElementById('per-unit-cost');
  const breakdown = document.getElementById('results-breakdown');
  const actions = document.getElementById('results-actions');

  const isValid = (el, min = 0, max = Infinity) => {
    const val = Number((el.value || '').toString());
    const ok = Number.isFinite(val) && val >= min && val <= max;
    el.classList.toggle('invalid', !ok);
    return ok;
  };

  const compute = () => {
    if (!isValid(price, 0) || !isValid(qty, 1) || !isValid(cif, 0) || !isValid(dutyPct, 0, 100) || !isValid(vatPct, 0, 100)) return;
    const p = Number(price.value);
    const q = Math.max(1, Math.floor(Number(qty.value)));
    const cifVal = Number(cif.value);
    const duty = Number(dutyPct.value);
    const vat = Number(vatPct.value);

    const base = p * q;
    const dutyCost = (duty / 100) * cifVal;
    const vatBase = cifVal + dutyCost;
    const vatCost = (vat / 100) * vatBase;
    const total = cifVal + dutyCost + vatCost + base;
    const perUnit = total / q;

    if (outBase) outBase.textContent = formatMoney(base);
    if (outCif) outCif.textContent = formatMoney(cifVal);
    if (outDuty) outDuty.textContent = formatMoney(dutyCost);
    if (outVat) outVat.textContent = formatMoney(vatCost);
    if (outTotal) outTotal.textContent = formatMoney(total);
    if (outPerUnit) outPerUnit.textContent = formatMoney(perUnit);
    if (breakdown) breakdown.style.display = '';
    if (actions) actions.style.display = '';
  };

  if (calcBtn) calcBtn.addEventListener('click', compute);
  [price, qty, cif, dutyPct, vatPct].forEach(el => el && el.addEventListener('input', () => el.classList.remove('invalid')));
  if (resetBtn) resetBtn.addEventListener('click', () => {
    [price, qty, cif, dutyPct, vatPct].forEach(el => { if (el) el.value = ''; if (el) el.classList.remove('invalid'); });
    if (breakdown) breakdown.style.display = 'none';
    if (actions) actions.style.display = 'none';
  });
}

function formatMoney(n) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n || 0);
  } catch (e) {
    return `$${(n || 0).toFixed(2)}`;
  }
}
