import { html, TemplateResult } from 'lit';

export function renderInModal<T extends TemplateResult>({
  body,
  title,
  subtitle,
  onClose
}: {
  body: T;
  title: T;
  subtitle: T;
  onClose: () => void;
}) {
  return html`
    <div class="modal">
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
