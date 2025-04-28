const sidenav = document.getElementById('sidenav');
const mainContent = document.getElementById('mainContent');
const toggleButton = document.getElementById('toggleButton');

addBotMessageToChat('Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?');

sidenav.classList.add('collapsed');

toggleClose.addEventListener('click', () => {
    sidenav.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

toggleOpen.addEventListener('click', () => {
    sidenav.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
});

async function sendMessageToOpenRouter(messageText) {
    const endpointUrl = 'http://212.192.9.89:2346/Bsuir?modelId=3';
    
    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageText),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const errorMessage = errorData?.error?.message || await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Message: ${errorMessage}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Endpoint Error:', error);
        throw error;
    }
}

function responseToMessage(messageText) {
    sendMessageToOpenRouter(messageText)
        .then(response => {
            const botResponse = response?.choices?.[0]?.message?.content || 
                               'Не удалось получить ответ от модели';
            addBotMessageToChat(botResponse);
        })
        .catch(error => {
            console.error('Error:', error);
            addBotMessageToChat('Извините, произошла ошибка: ' + 
                              (error.message || 'Попробуйте еще раз позже'));
        });
}

function removeAnimations(chatContainer) {
    const children = chatContainer.children;
    if (!children) return;

    for (let child of children) {
        child.style.animation = 'none';
        child.style.backgroundColor.opacity = '0.9';
    }
}

function AnimateExpansion(messageElement, message, chatContainer, borderAnimationName){

    const defaultScrollHeight = chatContainer.scrollHeight;

    setTimeout(() => {
        messageElement.style.transition = 'max-width 0.5s ease-out, opacity 0.3s ease-in';
        messageElement.style.opacity = '1';
        messageElement.style.animation = borderAnimationName + ' 4s ease-in-out infinite';

    let index = 0;
    const textInterval = setInterval(() => {
        if (index < message.length) {
            const span = document.createElement('span');
            span.textContent = message[index];
            span.style.opacity = '0';
            messageElement.appendChild(span);
            
            setTimeout(() => {
                span.style.transition = 'opacity 0.1s ease-in';
                span.style.opacity = '1';
            }, 50);
            
            index++;
        } else {
            clearInterval(textInterval);
        }
    }, 10);

            const startTime = performance.now();
            const duration = 800;
            const scrollDiff = chatContainer.scrollHeight - defaultScrollHeight;

            function scrollStep(timestamp) {
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                chatContainer.scrollTop = chatContainer.scrollHeight + scrollDiff * progress;

                if (progress < 1) {
                    requestAnimationFrame(scrollStep);
                }
            }

            requestAnimationFrame(scrollStep);
    }, 100);
}

function addUserMessageToChat(message) {
    const chatContainer = document.getElementById('chat-container');
    removeAnimations(chatContainer)

    const messageElement = document.createElement('div');

    messageElement.className = 'message';
    messageElement.style.backgroundColor = '#29263b';

    chatContainer.appendChild(messageElement);

    AnimateExpansion(messageElement, message, chatContainer, "glowingBorder");
}

function addBotMessageToChat(message){
    const chatContainer = document.getElementById('chat-container');
    removeAnimations(chatContainer)

    const messageElement = document.createElement('div');

    messageElement.classList.add('markdown-content');
    messageElement.innerHTML = renderMarkdown(message);

    initDarkSyntaxHighlighting();
    messageElement.className = 'message bot';

    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);

    AnimateExpansion(messageElement, '', chatContainer, "glowingBorderBlue");
}

document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input');
    const message = userInput.innerText.trim();
    
    if (message) {
        addUserMessageToChat(message);
        clearInput(userInput);
        responseToMessage(message)
    }
});

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const message = this.innerText.trim();
        clearInput(this);

        if (message) {
            addUserMessageToChat(message);
            responseToMessage(message)
        }
    }
});

function clearInput(userInput){
    setTimeout(() => {
        userInput.innerHTML = '';
    }, 5);
}

    document.getElementById('user-input').addEventListener('paste', function(event) {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    });

const editableDiv = document.getElementById('user-input');

function checkPlaceholder() {
    if (editableDiv.innerText === '') {
        editableDiv.classList.add('empty');

    } else {
        editableDiv.classList.remove('empty');
    }
}

function renderMarkdown(content, forcePlainText = false) {
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

/**
 * Наверное не нужно (но надо проверить)
 * Включает подсветку синтаксиса для блоков кода
 * @param {Element|string} [target] - Элемент DOM или селектор (опционально)
 */
function highlightCode(target = document) {
    // Проверяем доступность hljs
    if (typeof hljs === 'undefined') {
      console.warn('Highlight.js not loaded! Skipping syntax highlighting.');
      return;
    }
  
    // Получаем целевой элемент
    const container = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
  
    if (!container) {
      console.warn('Target element not found:', target);
      return;
    }
  
    // Настройки для автоопределения языков
    hljs.configure({
      languages: [], // Автодетект всех языков
      ignoreUnescapedHTML: true
    });
  
    // Применяем подсветку ко всем блокам кода
    container.querySelectorAll('pre code:not(.hljs)').forEach(block => {
      hljs.highlightElement(block);
    });
  }

editableDiv.addEventListener('input', checkPlaceholder);
editableDiv.addEventListener('blur', checkPlaceholder);


/**
 * Инициализирует подсветку синтаксиса с тёмной темой
 * @param {string} [theme='github-dark'] - Название тёмной темы
 */
async function initDarkSyntaxHighlighting(theme = 'github-dark') {
    // Проверяем, не подключен ли уже highlight.js
    if (typeof hljs !== 'undefined') {
      await applyDarkTheme(theme);
      highlightAllCodeBlocks();
      return;
    }
  
    // Динамически подгружаем необходимые ресурсы
    try {
      await Promise.all([
        loadCSS(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/autodetect.min.js')
      ]);
      
      highlightAllCodeBlocks();
    } catch (error) {
      console.error('Error loading syntax highlighting:', error);
    }
  }
  
  /**
   * Подсвечивает все блоки кода на странице
   */
  function highlightAllCodeBlocks() {
    hljs.configure({
      languages: [], // Автоопределение языков
      ignoreUnescapedHTML: true
    });
  
    document.querySelectorAll('pre code:not(.hljs)').forEach(block => {
      hljs.highlightElement(block);
    });
  }
  
  /**
   * Применяет тёмную тему (если уже есть hljs)
   */
  async function applyDarkTheme(theme) {
    // Удаляем старые темы если есть
    document.querySelectorAll('link[data-hljs-theme]').forEach(link => link.remove());
    
    await loadCSS(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`, true);
  }
  
  /**
   * Загружает CSS файл
   */
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
  
  /**
   * Загружает JS файл
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }