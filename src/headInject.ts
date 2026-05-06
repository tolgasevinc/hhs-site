const INJECT_ATTR = 'data-hhs-head-inject';

const clearInjectedNodes = () => {
  document.head.querySelectorAll(`[${INJECT_ATTR}]`).forEach((node) => node.remove());
};

/**
 * Admin panelinden gelen &lt;head&gt; içi HTML parçasını gerçek document.head'e uygular.
 * Script etiketleri yeniden oluşturulur; tarayıcıda çalıştırılabilmesi için innerHTML ile basılmaz.
 */
export function applyInjectedHeadHtml(html: string | undefined | null): () => void {
  clearInjectedNodes();
  const trimmed = typeof html === 'string' ? html.trim() : '';
  if (!trimmed) {
    return clearInjectedNodes;
  }

  const parsed = new DOMParser().parseFromString(
    `<!DOCTYPE html><html><head>${trimmed}</head></html>`,
    'text/html',
  );

  Array.from(parsed.head.children).forEach((el) => {
    if (el.tagName === 'SCRIPT') {
      const source = el as HTMLScriptElement;
      const script = document.createElement('script');
      script.setAttribute(INJECT_ATTR, '');
      for (let i = 0; i < source.attributes.length; i += 1) {
        const attr = source.attributes[i];
        script.setAttribute(attr.name, attr.value);
      }
      if (!script.src && source.textContent) {
        script.text = source.textContent;
      }
      document.head.appendChild(script);
    } else {
      const clone = el.cloneNode(true) as HTMLElement;
      clone.setAttribute(INJECT_ATTR, '');
      document.head.appendChild(clone);
    }
  });

  return clearInjectedNodes;
}
