// Open/close the depth layer; keep it out of the tab order when closed.
import { register } from './registry.js';
import { OPEN_DEPTH_EVENT } from './nav.js';

export function initDepth(section) {
  const inner = section.querySelector('.depth__inner');
  const heading = section.querySelector('#h-go-deeper');
  const openers = document.querySelectorAll('[data-open-depth]');
  const closer = section.querySelector('[data-close-depth]');

  function setOpen(open, { focus = true } = {}) {
    section.classList.toggle('is-open', open);
    if (open) inner.removeAttribute('inert'); else inner.setAttribute('inert', '');
    openers.forEach((b) => b.setAttribute('aria-expanded', String(open)));
    if (open && focus) heading.focus({ preventScroll: true });
    if (!open && focus) openers[0]?.focus();
  }
  openers.forEach((b) => b.addEventListener('click', () => { setOpen(true); section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  closer.addEventListener('click', () => setOpen(false));
  document.addEventListener(OPEN_DEPTH_EVENT, () => setOpen(true, { focus: false }));
  if (location.hash === '#go-deeper') setOpen(true, { focus: false });
  return { open: () => setOpen(true), close: () => setOpen(false) };
}

register('#go-deeper', initDepth);
