// toni/src/app/app.ts

import { renderAppUI } from './app.ui';
import { Router } from './router';

export function initApp() {
  const root = document.getElementById('app-root');
  if (!root) return;

  renderAppUI(root);
  Router.init();
}

initApp();
