const HEAD_INJECT_ATTR = 'data-hhs-head-inject';
const BODY_INJECT_ATTR = 'data-hhs-body-inject';

const clearInjectedHeadNodes = () => {
  document.head.querySelectorAll(`[${HEAD_INJECT_ATTR}]`).forEach((node) => node.remove());
};

const clearInjectedBodyNodes = () => {
  document.body.querySelectorAll(`[${BODY_INJECT_ATTR}]`).forEach((node) => node.remove());
};

/**
 * DOMParser, güvenlik nedeniyle &lt;script&gt; gövdelerini boş bırakabilir.
 * &lt;template&gt;.innerHTML parçası satır içi script metnini korur (etiketler inert kalır).
 */
const htmlSnippetToElements = (html: string): Element[] => {
  const tpl = document.createElement('template');
  tpl.innerHTML = html.trim();
  return Array.from(tpl.content.children);
};

const appendParsedHeadishChild = (el: Element, target: HTMLElement | DocumentFragment, attr: string) => {
  if (el.tagName === 'SCRIPT') {
    const source = el as HTMLScriptElement;
    const script = document.createElement('script');
    script.setAttribute(attr, '');
    for (let i = 0; i < source.attributes.length; i += 1) {
      const a = source.attributes[i];
      script.setAttribute(a.name, a.value);
    }
    const hasSrc = Boolean(script.getAttribute('src')?.trim());
    if (!hasSrc) {
      const body = source.text || source.textContent || '';
      if (body.trim()) {
        script.text = body;
      }
    }
    target.appendChild(script);
  } else {
    const clone = el.cloneNode(true) as HTMLElement;
    clone.setAttribute(attr, '');
    target.appendChild(clone);
  }
};

/**
 * Admin panelinden gelen &lt;head&gt; içi HTML parçasını gerçek document.head'e uygular.
 * Script etiketleri yeniden oluşturulur; tarayıcıda çalıştırılabilmesi için innerHTML ile basılmaz.
 */
export function applyInjectedHeadHtml(html: string | undefined | null): () => void {
  clearInjectedHeadNodes();
  const trimmed = typeof html === 'string' ? html.trim() : '';
  if (!trimmed) {
    return clearInjectedHeadNodes;
  }

  htmlSnippetToElements(trimmed).forEach((el) => {
    appendParsedHeadishChild(el, document.head, HEAD_INJECT_ATTR);
  });

  return clearInjectedHeadNodes;
}

/**
 * &lt;body&gt; hemen altına (root’tan önce) eklenen snippet'ler — örn. GTM &lt;noscript&gt; iframe.
 */
export function applyInjectedBodyHtml(html: string | undefined | null): () => void {
  clearInjectedBodyNodes();
  const trimmed = typeof html === 'string' ? html.trim() : '';
  if (!trimmed) {
    return clearInjectedBodyNodes;
  }

  const fragment = document.createDocumentFragment();
  htmlSnippetToElements(trimmed).forEach((el) => {
    appendParsedHeadishChild(el, fragment, BODY_INJECT_ATTR);
  });

  document.body.insertBefore(fragment, document.body.firstChild);

  return clearInjectedBodyNodes;
}
