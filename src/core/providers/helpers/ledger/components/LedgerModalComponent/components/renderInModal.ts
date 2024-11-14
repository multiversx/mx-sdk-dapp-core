import { html, TemplateResult } from 'lit';

export function renderInModal<T extends TemplateResult>({
  body,
  title,
  subtitle,
  isOpen,
  onClose
}: {
  body: T;
  title: T;
  subtitle: T;
  isOpen: boolean;
  onClose: () => void;
}) {
  return html`
    <div class="modal" style="display: ${isOpen ? 'block' : 'none'}">
      <div class="modal-content">
        <div class="modal-header">
          <span class="close" @click=${onClose}>✕</span>
          <h2>${title}</h2>
          <p>${subtitle}</p>
        </div>
        ${body}
      </div>
    </div>
  `;
}
