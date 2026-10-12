/**
 * Simple Lightweight Markdown Renderer for Hindi Pods
 * Converts pure Devanagari Markdown files into clean, readable HTML.
 */
class SimpleMarkdownRenderer {
  constructor() {}

  render(markdown) {
    if (!markdown) return '';

    let lines = markdown.replace(/\r\n/g, '\n').split('\n');
    let html = [];
    let inList = false;
    let listType = null; // 'ul' or 'ol'
    let inBlockquote = false;
    let blockquoteLines = [];

    const flushList = () => {
      if (inList) {
        html.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
    };

    const flushBlockquote = () => {
      if (inBlockquote) {
        html.push(`<blockquote>${this.renderInline(blockquoteLines.join(' '))}</blockquote>`);
        inBlockquote = false;
        blockquoteLines = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let trimmed = line.trim();

      // Horizontal rule
      if (/^(\*{3,}|-{3,}|_{3,})$/.test(trimmed)) {
        flushList();
        flushBlockquote();
        html.push('<hr>');
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('>')) {
        flushList();
        inBlockquote = true;
        blockquoteLines.push(trimmed.replace(/^>\s*/, ''));
        continue;
      } else if (inBlockquote) {
        flushBlockquote();
      }

      // Headers
      if (trimmed.startsWith('#')) {
        flushList();
        flushBlockquote();
        let match = trimmed.match(/^(#{1,6})\s+(.*)$/);
        if (match) {
          let level = match[1].length;
          let content = this.renderInline(match[2]);
          html.push(`<h${level}>${content}</h${level}>`);
          continue;
        }
      }

      // Unordered List (- or *)
      let ulMatch = line.match(/^(\s*)([-*])\s+(.*)$/);
      if (ulMatch) {
        flushBlockquote();
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
          html.push('<ul>');
        }
        html.push(`<li>${this.renderInline(ulMatch[3])}</li>`);
        continue;
      }

      // Ordered List (1. or १.)
      let olMatch = line.match(/^(\s*)([0-9]+|[०-९]+)\.\s+(.*)$/);
      if (olMatch) {
        flushBlockquote();
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
          html.push('<ol>');
        }
        html.push(`<li>${this.renderInline(olMatch[3])}</li>`);
        continue;
      }

      // If we were in a list and hit non-list line
      if (inList) {
        flushList();
      }

      // Empty line
      if (trimmed === '') {
        continue;
      }

      // Audio pause tags special highlight (e.g., [३ सेकंड का मौन / विराम])
      let processedLine = this.renderInline(line);
      html.push(`<p>${processedLine}</p>`);
    }

    flushList();
    flushBlockquote();

    return html.join('\n');
  }

  renderInline(text) {
    if (!text) return '';

    // Audio pause tag highlight [X सेकंड का मौन / विराम]
    text = text.replace(/\[([^\]]*?(?:मौन|विराम|सेकंड)[^\]]*?)\]/g, '<span class="pause-cue">⏱️ [$1]</span>');

    // Bold + Italic (***text*** or ___text___)
    text = text.replace(/(\*\*\*|___)(.*?)\1/g, '<strong><em>$2</em></strong>');

    // Bold (**text** or __text__)
    text = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');

    // Italic (*text* or _text_)
    text = text.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');

    // Code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Links [text](url)
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

    return text;
  }
}

// Export as global
window.SimpleMarkdownRenderer = SimpleMarkdownRenderer;
