import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import hljs from "highlight.js";

marked.use(markedKatex({ throwOnError: false }));

const renderer = new marked.Renderer();
renderer.code = (code) => {
    if (code.lang === "mermaid") {
        return `<div class="mermaid">${code.text}</div>`;
    }

    const validLang = !!(code.lang && hljs.getLanguage(code.lang));
    const highlighted = validLang
        ? hljs.highlight(code.text, { language: code.lang! }).value
        : code.text;
    return `<pre><code class="hljs language-${code.lang}">${highlighted}</code></pre>`;
};
marked.use({ renderer });

export { marked };
