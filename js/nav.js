// Ruled margin: line numbers, scroll-spy, hash → depth layer.
import { register } from './registry.js';

const LINE_PX = 32;
export const OPEN_DEPTH_EVENT = 'jevvy:open-depth';

export function initNav(nav) {
  const markers = [...nav.querySelectorAll('[data-marker]')];
  const sections = markers.map((a) => document.getElementById(a.dataset.marker)).filter(Boolean);
  const numbers = nav.querySelector('[data-line-numbers]');

  // Line numbers: a column sized to the viewport, offset by scroll position.
  function renderNumbers() {
    if (!numbers || getComputedStyle(numbers).display === 'none') return;
    const count = Math.ceil(window.innerHeight / LINE_PX) + 1;
    const start = Math.floor(window.scrollY / LINE_PX);
    const frag = [];
    for (let i = 0; i < count; i++) frag.push(`<li>${String(start + i + 1).padStart(2, '0')}</li>`);
    numbers.innerHTML = frag.join('');
  }
  let ticking = false;
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { renderNumbers(); ticking = false; }); } }, { passive: true });
  window.addEventListener('resize', renderNumbers);
  renderNumbers();

  // Scroll-spy: the section whose top is closest above the 40% line wins.
  function spy() {
    const line = window.innerHeight * 0.4;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    markers.forEach((a) => a.dataset.marker === current?.id ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current'));
  }
  window.addEventListener('scroll', spy, { passive: true });
  spy();

  // DEEPER marker and hash both open the depth layer before scrolling.
  nav.querySelectorAll('[data-opens-depth]').forEach((a) => a.addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent(OPEN_DEPTH_EVENT));
  }));
  function checkHash() { if (location.hash === '#go-deeper') document.dispatchEvent(new CustomEvent(OPEN_DEPTH_EVENT)); }
  window.addEventListener('hashchange', checkHash);
  checkHash();
}

register('nav.margin', initNav);
