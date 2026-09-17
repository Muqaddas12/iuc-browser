import { ReaderArticle } from '../types/browser';

export const READER_EXTRACTION_SCRIPT = `
(function() {
  function extractArticle() {
    var title = document.title || '';
    var h1 = document.querySelector('h1');
    if (h1 && h1.innerText) {
      title = h1.innerText.trim();
    }

    // Try finding byline / author
    var byline = '';
    var authorEl = document.querySelector('[rel="author"], .author, .byline, time');
    if (authorEl && authorEl.innerText) {
      byline = authorEl.innerText.trim();
    }

    // Clone candidate container
    var candidate = document.querySelector('article, main, [role="main"], .post-content, .article-body, #content');
    if (!candidate) {
      candidate = document.body;
    }

    var clone = candidate.cloneNode(true);

    // Remove boilerplate elements
    var junk = clone.querySelectorAll('nav, footer, header, aside, script, style, iframe, form, button, .ad, .ads, [class*="ad-"], [id*="ad-"], .comments, .social-share');
    for (var i = 0; i < junk.length; i++) {
      junk[i].remove();
    }

    var paragraphs = clone.querySelectorAll('p, h2, h3, h4, blockquote, ul, ol, img');
    var cleanHtml = '';
    var wordCount = 0;

    for (var j = 0; j < paragraphs.length; j++) {
      var p = paragraphs[j];
      var text = p.innerText ? p.innerText.trim() : '';
      if (p.tagName.toLowerCase() === 'img') {
        var src = p.getAttribute('src');
        if (src && src.startsWith('http')) {
          cleanHtml += '<img src="' + src + '" style="max-width:100%; border-radius:8px; margin: 16px 0;" />';
        }
      } else if (text.length > 20) {
        cleanHtml += '<' + p.tagName.toLowerCase() + '>' + p.innerHTML + '</' + p.tagName.toLowerCase() + '>';
        wordCount += text.split(/\\s+/).length;
      }
    }

    var readTime = Math.max(1, Math.ceil(wordCount / 200));

    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'READER_ARTICLE_DATA',
      payload: {
        title: title,
        byline: byline,
        content: cleanHtml || '<p>' + (clone.innerText || 'No text could be extracted.') + '</p>',
        readingTimeMinutes: readTime,
        url: window.location.href
      }
    }));
  }

  extractArticle();
})();
true;
`;

export function generateReaderHtml(article: ReaderArticle, theme: 'dark' | 'sepia' | 'light'): string {
  const themes = {
    dark: { bg: '#121316', text: '#E2E8F0', secondary: '#94A3B8', border: '#2D3748' },
    sepia: { bg: '#FBF0D9', text: '#5F4B32', secondary: '#8F785D', border: '#E2D1B3' },
    light: { bg: '#FFFFFF', text: '#1A202C', secondary: '#718096', border: '#E2E8F0' }
  };

  const current = themes[theme] || themes.dark;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
      <style>
        body {
          background-color: ${current.bg};
          color: ${current.text};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
          line-height: 1.8;
          font-size: 19px;
          padding: 24px 20px 80px 20px;
          margin: 0 auto;
          max-width: 680px;
          word-wrap: break-word;
        }
        h1 {
          font-size: 28px;
          line-height: 1.3;
          font-weight: 800;
          margin-bottom: 12px;
          color: ${current.text};
        }
        .meta {
          font-size: 14px;
          color: ${current.secondary};
          border-bottom: 1px solid ${current.border};
          padding-bottom: 16px;
          margin-bottom: 24px;
          display: flex;
          gap: 16px;
        }
        p {
          margin-bottom: 22px;
        }
        img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }
        blockquote {
          border-left: 4px solid #6366F1;
          margin: 0;
          padding-left: 16px;
          color: ${current.secondary};
          font-style: italic;
        }
        a {
          color: #6366F1;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <h1>${article.title}</h1>
      <div class="meta">
        ${article.byline ? `<span>✍️ ${article.byline}</span>` : ''}
        <span>⏱️ ${article.readingTimeMinutes} min read</span>
      </div>
      <div>
        ${article.content}
      </div>
    </body>
    </html>
  `;
}

