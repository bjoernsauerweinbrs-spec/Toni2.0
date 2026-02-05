// toni/src/components/Modal.tsx

export function Modal(content: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'modal-wrapper';

  wrapper.innerHTML = `
    <div class="modal">
      <div class="modal-content">${content}</div>
      <button class="modal-close">Schließen</button>
    </div>
  `;

  wrapper.querySelector('.modal-close')?.addEventListener('click', () => {
    wrapper.remove();
  });

  return wrapper;
}
