export function renderMarkdown(content, forcePlainText = false) {
    const isMarkdown = !forcePlainText && /^[\s\S]*([*_`#\[!]|```|\-\s|\d\.\s)/.test(content);
    
    if (isMarkdown) {
        marked.setOptions({
            breaks: true,
            gfm: true,
            smartypants: true,
            xhtml: true
        });
        
        let htmlContent = marked.parse(content);
        
        htmlContent = htmlContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

        htmlContent = htmlContent.replace(
            /<table>[\s\S]*?<\/table>/g, 
            match => `<div class="table-container">${match}</div>`
        );
        
        return htmlContent;
    } else {
        const escapedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        return escapedContent.replace(/\n/g, '<br>');
    }
}

export async function tryLoadAndHighlight(theme = 'github-dark') {
    if (typeof hljs !== 'undefined') {
      await applyDarkTheme(theme);
      highlightAllCodeBlocks();
      return;
    }
  
    try {
      await Promise.all([
        loadCSS(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js')
      ]);
    } catch (error) {
      console.error('Error loading syntax highlighting:', error);
    }
}
  
export function highlightAllCodeBlocks() {
    hljs.configure({
      ignoreUnescapedHTML: true
    });
  
    document.querySelectorAll('pre code:not(.hljs)').forEach(block => {
      hljs.highlightElement(block);
    });
}
  
export async function applyDarkTheme(theme) {
    document.querySelectorAll('link[data-hljs-theme]').forEach(link => link.remove());
    await loadCSS(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`, true);
}
  
function loadCSS(href, isTheme = false) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (isTheme) link.setAttribute('data-hljs-theme', '');
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
}