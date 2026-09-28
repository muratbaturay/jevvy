// Reveal-on-scroll, once per element, off under reduced motion.
import { register } from './registry.js';

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initReveal(root = document) {
  const els = root.querySelectorAll('[data-reveal]');
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-visible')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { threshold: 0.2 });
  els.forEach((el) => io.observe(el));
}

register('body', () => initReveal(document));
