// Registry of [selector, init] pairs. Feature modules call register() at load.
const inits = [];

export function register(selector, init) {
  inits.push([selector, init]);
}

export function initAll(root = document) {
  for (const [selector, init] of inits) {
    root.querySelectorAll(selector).forEach((el) => init(el));
  }
}
