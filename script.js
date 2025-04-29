import { animateSendButtonLoading } from './button-animation.js'
import { sendButtonReturnToDefault } from './button-animation.js'
import { animateHtmlExpansion } from './bot-message-animation.js';
import { buildFillerContent } from './bot-message-animation.js';
import { fastScrollToBottom } from './bot-message-animation.js';
import { loadChatHistory, saveMessage, clearChatHistory, setGreetingTime } from './chat-history.js';

const sidenav = document.getElementById('sidenav');
const chatContainer = document.getElementById('chat-container');
const chatInputContainer = document.getElementById('chat-input-container');
const toggleButton = document.getElementById('toggleButton');

let canMessageBeSent = true;
let context = Array();

renderChatHistory();
fastScrollToBottom(chatContainer);
await tryLoadAndHighlight();

if (setGreetingTime()) addBotMessageToChat('<p>Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?<p>', true, false);
tryLoadAndHighlight();

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
    const endpointUrl = 'https://api.bsuirbot.site/Bsuir?modelId=0';  

    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify("ЗАПРОС ОТ ПОЛЬЗОВАТЕЛЯ НА КОТОРЫЙ ТЫ ДОЛЖЕН ОТВЕТИТЬ: " + messageText + "; СТАРЫЕ СООБЩЕНИЯ ОТ ПОЛЬЗОВАТЕЛЯ (МОЖНО И ИГНОРИРОВАТЬ): " + context.toString()),
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

function renderChatHistory() {
    const messages = loadChatHistory();
    console.log(messages);
    if (!messages || messages.length === 0) return;

    for (let i = 0; i < messages.length; i++) {
        if (!messages[i] || messages[i] === '') continue;

        if (i % 2 === 0) {
            // Четные индексы - пользователь
            addUserMessageToChat(messages[i].text, false);
        } else {
            // Нечетные индексы - бот
            addBotMessageToChat(messages[i].text, false);
        }
    }

    for (let i = messages.length - 1; i >= 0; i--) {
        if (i % 2 === 0) {
            if (context.length >= 5) return;
            context.push(messages[i].text);
        }
    }

    console.log("Context:" + context);
}

function responseToMessage(messageText) {
    addFillerToChat(buildFillerContent());

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
        }).finally(() => {
            canMessageBeSent = true;
        });
}

function removeAnimationsForPreviousBlocks(chatContainer) {
    const children = chatContainer.children;
    if (!children) return;

    for (let child of children) {
        child.style.animation = 'none';
        //child.style.backgroundColor.opacity = '0.9';
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

    }, 100);
}

function addUserMessageToChat(message, afterLoad = true) {
    if (afterLoad) canMessageBeSent = false;
    const chatContainer = document.getElementById('chat-container');
    removeAnimationsForPreviousBlocks(chatContainer);

    const messageElement = document.createElement('div');

    messageElement.className = 'message';
    messageElement.style.backgroundColor = '#29263b';

    chatContainer.appendChild(messageElement);

    //AnimateExpansion(messageElement, message, chatContainer, "glowingBorder");
    if (afterLoad){
        messageElement.style.animation = 'glowingBorder' + ' 4s ease-in-out infinite';
        animateHtmlExpansion(messageElement, renderMarkdown(message), chatContainer, "expand-animation");
        saveMessage(message);

        context.push(message);
        if(context.length > 5) context.shift();
    }
    else {
        messageElement.innerHTML = message;
        messageElement.style.opacity = '1';
    }
}

function addFillerToChat(innerHTML){
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.id = 'filler';
    messageElement.className = 'message bot';

    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);
    messageElement.style.animation = 'glowingBorderBlue' + ' 4s ease-in-out infinite';

    animateHtmlExpansion(messageElement, innerHTML, chatContainer, "expand-animation");
    //messageElement.innerHTML = innerHTML;
    //document.getElementById('filler').classList.remove('hidden');
}

function addBotMessageToChat(message, afterLoad = true, shouldSave = true){
    const filler = document.getElementById('filler');
    
    if (filler){
        filler.remove();
    }

    const chatContainer = document.getElementById('chat-container');
    removeAnimationsForPreviousBlocks(chatContainer);
    sendButtonReturnToDefault();

    const messageElement = document.createElement('div');

    messageElement.classList.add('markdown-content');
    //messageElement.innerHTML = renderMarkdown(message);
    messageElement.className = 'message bot';
    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);

    if (afterLoad){
        messageElement.style.animation = 'glowingBorderBlue' + ' 4s ease-in-out infinite';
        animateHtmlExpansion(messageElement, renderMarkdown(message), chatContainer, "expand-animation");
        if (shouldSave) saveMessage(message);

        //tryLoadAndHighlight();
        highlightAllCodeBlocks();
    }
    else {
        messageElement.innerHTML = renderMarkdown(message);
        messageElement.style.opacity = '1';
    }

    //AnimateExpansion(messageElement, '', chatContainer, "glowingBorderBlue");
}

document.getElementById('clear-history').addEventListener('click', clearChatHistory);

document.getElementById('send-button').addEventListener('click', function() {
    if (!canMessageBeSent) return;

    const userInput = document.getElementById('user-input');
    const message = userInput.innerText.trim();
    
    if (message) {
        addUserMessageToChat(message);
        clearInput(userInput);
        animateSendButtonLoading();
        responseToMessage(message);
    }
});

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const message = this.innerText.trim();
        
        if (!message) clearInput(this);

        if (message && canMessageBeSent) {
            clearInput(this);
            addUserMessageToChat(message);
            animateSendButtonLoading();
            responseToMessage(message);
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

editableDiv.addEventListener('input', checkPlaceholder);
editableDiv.addEventListener('blur', checkPlaceholder);

async function tryLoadAndHighlight(theme = 'github-dark') {
    if (typeof hljs !== 'undefined') {
      await applyDarkTheme(theme);
      highlightAllCodeBlocks();
      return;
    }
  
    try {
      await Promise.all([
        loadCSS(`https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/${theme}.min.css`),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js'),
        //loadScript('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/languages/autodetect.min.js') // does not work and probably is not needed
      ]);
    } catch (error) {
      console.error('Error loading syntax highlighting:', error);
    }
}
  
function highlightAllCodeBlocks() {
    hljs.configure({
      ignoreUnescapedHTML: true
    });
  
    document.querySelectorAll('pre code:not(.hljs)').forEach(block => {
      hljs.highlightElement(block);
    });
}
  
async function applyDarkTheme(theme) {
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