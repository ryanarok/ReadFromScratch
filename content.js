(() => {
  if (window.__glosbeWordLinksInstalled) return;
  window.__glosbeWordLinksInstalled = true;

  const WORD_RE = /[\p{L}\p{M}\p{N}]+(?:['’\-][\p{L}\p{M}\p{N}]+)*/gu;
  const SKIP_TAGS = new Set([
    "A", "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT",
    "OPTION", "BUTTON", "CODE", "PRE", "KBD", "SAMP", "SVG", "MATH"
  ]);

  function shouldSkip(node) {
    const parent = node.parentElement;
    if (!parent) return true;
    if (parent.isContentEditable) return true;
    if (parent.closest("[data-glosbe-linked='true']")) return true;
    return SKIP_TAGS.has(parent.tagName) || Boolean(parent.closest(
      "a, script, style, noscript, textarea, input, select, option, button, code, pre, kbd, samp, svg, math"
    ));
  }

  function linkifyTextNode(node) {
    const text = node.nodeValue;
    WORD_RE.lastIndex = 0;
    const matches = [...text.matchAll(WORD_RE)];
    if (!matches.length) return 0;

    const fragment = document.createDocumentFragment();
    let cursor = 0;

    for (const match of matches) {
      const word = match[0];
      const start = match.index;
      if (start > cursor) fragment.append(document.createTextNode(text.slice(cursor, start)));

      const link = document.createElement("a");
      link.href = "https://es.glosbe.com/es/es/" + encodeURIComponent(word);
      link.textContent = word;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.title = "Buscar «" + word + "» en Glosbe";
      link.dataset.glosbeLinked = "true";
      fragment.append(link);
      cursor = start + word.length;
    }

    if (cursor < text.length) fragment.append(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(fragment, node);
    return matches.length;
  }

  function convertPage() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (!shouldSkip(node) && node.nodeValue.trim()) nodes.push(node);
    }

    let count = 0;
    for (const textNode of nodes) count += linkifyTextNode(textNode);
    return count;
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message && message.action === "convert-words") {
      convertPage();
    }
  });
})();
