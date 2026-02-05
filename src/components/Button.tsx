// toni/src/components/Button.tsx

export function Button(label: string, onClick: () => void): HTMLElement {
  const btn = document.createElement('button');
  btn.className = 'btn';
  btn.innerText = label;
  btn.addEventListener('click', onClick);
  return btn;
}
