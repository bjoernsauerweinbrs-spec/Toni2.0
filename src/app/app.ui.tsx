// toni/src/app/app.ui.tsx

import { Router } from './router';

export function renderAppUI(root: HTMLElement) {
  root.innerHTML = `
    <div class="app-layout">
      <nav class="app-nav">
        <button data-route="team">Mannschaft</button>
        <button data-route="arena">Arena</button>
        <button data-route="analysis">Analyse</button>
        <button data-route="training">Training</button>
        <button data-route="settings">Einstellungen</button>
      </nav>

      <main id="app-view" class="app-view"></main>
    </div>
  `;

  root.querySelectorAll('[data-route]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const route = btn.getAttribute('data-route')!;
      Router.navigate(route);
    });
  });
}
