// Entry point. Later tasks add one import line per feature module here,
// in this order: reveal, nav, depth, router-demo, ledger, worktree-demo, proof-demo.
import { initAll } from './registry.js';
import './reveal.js';
import './nav.js';
import './depth.js';
import './router-demo.js';
import './ledger.js';
import './worktree-demo.js';

document.addEventListener('DOMContentLoaded', () => initAll());
