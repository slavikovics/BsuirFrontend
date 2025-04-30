import { animateSendButtonLoading } from './button-animation.js'
import { sendButtonReturnToDefault } from './button-animation.js'
import { animateHtmlExpansion } from './bot-message-animation.js';
import { buildFillerContent } from './bot-message-animation.js';
import { fastScrollToBottom } from './bot-message-animation.js';
import { loadChatHistory, saveMessage, clearChatHistory, shouldGreetUser } from './chat-history.js';
import { sendMessageToOpenRouter } from './open-router.js';
import { removeAnimationsForPreviousBlocks, checkPlaceholder, clearInput } from './chat-animations.js';
import { renderMarkdown, tryLoadAndHighlight, highlightAllCodeBlocks } from './markdown.js';

const sidenav = document.getElementById('sidenav');
const chatContainer = document.getElementById('chat-container');

let canMessageBeSent = true;
let context = Array();

renderChatHistory();
fastScrollToBottom(chatContainer);
await tryLoadAndHighlight();
greet();
collapseSidenav();
configureToggleClose();
configureToggleOpen();
configureChatHistoryDeletion();
configureSendButtonClick();
configureInputOnEnterKey();
configurePasting();
configureUserInputPlaceholder();

function greet(){
    if (shouldGreetUser()) addBotMessageToChat('<p>Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?<p>', true, false);
    tryLoadAndHighlight();
}

function collapseSidenav(){
    sidenav.classList.add('collapsed');
}

function configureToggleClose(){
    toggleClose.addEventListener('click', () => {
        sidenav.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

function configureToggleOpen(){
    toggleOpen.addEventListener('click', () => {
        sidenav.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
    });
}

function renderChatHistory() {
    const messages = loadChatHistory();
    console.log(messages);
    if (!messages || messages.length === 0) return;

    for (let i = 0; i < messages.length; i++) {
        if (!messages[i] || messages[i] === '') continue;

        if (i % 2 === 0) {
            addUserMessageToChat(messages[i].text, false);
        } else {
            addBotMessageToChat(messages[i].text, false);
        }
    }

    for (let i = messages.length - 1; i >= 0; i--) {
        if (i % 2 === 0) {
            if (context.length >= 5) return;
            context.push(messages[i].text);
        }
    }

    console.log("Previous messages (context): " + context.toString());
}

function respondToUserMessage(messageText) {
    addFillerToChat(buildFillerContent());

    sendMessageToOpenRouter(messageText, context)
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

function addUserMessageToChat(message, afterLoad = true) {
    if (afterLoad) canMessageBeSent = false;
    const chatContainer = document.getElementById('chat-container');
    removeAnimationsForPreviousBlocks(chatContainer);

    const messageElement = document.createElement('div');

    messageElement.className = 'message';
    messageElement.style.backgroundColor = '#29263b';

    chatContainer.appendChild(messageElement);

    if (afterLoad) {
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

function addFillerToChat(innerHTML) {
    const chatContainer = document.getElementById('chat-container');
    const messageElement = document.createElement('div');
    messageElement.id = 'filler';
    messageElement.className = 'message bot';

    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);
    messageElement.style.animation = 'glowingBorderBlue' + ' 4s ease-in-out infinite';

    animateHtmlExpansion(messageElement, innerHTML, chatContainer, "expand-animation");
}

function addBotMessageToChat(message, afterLoad = true, shouldSave = true) {
    const filler = document.getElementById('filler');
    
    if (filler) {
        filler.remove();
    }

    const chatContainer = document.getElementById('chat-container');
    removeAnimationsForPreviousBlocks(chatContainer);
    sendButtonReturnToDefault();

    const messageElement = document.createElement('div');

    messageElement.classList.add('markdown-content');
    messageElement.className = 'message bot';
    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);

    if (afterLoad) {
        messageElement.style.animation = 'glowingBorderBlue' + ' 4s ease-in-out infinite';
        animateHtmlExpansion(messageElement, renderMarkdown(message), chatContainer, "expand-animation");
        if (shouldSave) saveMessage(message);
    }
    else {
        messageElement.innerHTML = renderMarkdown(message);
        messageElement.style.opacity = '1';
    }

    if (afterLoad) {
        //highlightAllCodeBlocks();
        //console.log("Tried to highlight all code blocks.");
    } 
}

function configureChatHistoryDeletion() {
    document.getElementById('clear-history').addEventListener('click', clearChatHistory);
}

function configureSendButtonClick() {
    document.getElementById('send-button').addEventListener('click', function() {
        if (!canMessageBeSent) return;
    
        const userInput = document.getElementById('user-input');
        const message = userInput.innerText.trim();
        
        if (message) {
            addUserMessageToChat(message);
            clearInput(userInput);
            animateSendButtonLoading();
            respondToUserMessage(message);
        }
    });
}

function configureInputOnEnterKey() {
    document.getElementById('user-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const message = this.innerText.trim();
            
            if (!message) clearInput(this);
    
            if (message && canMessageBeSent) {
                clearInput(this);
                addUserMessageToChat(message);
                animateSendButtonLoading();
                respondToUserMessage(message);
            }
        }
    });
}

function configurePasting() {
    document.getElementById('user-input').addEventListener('paste', function(event) {
        event.preventDefault();
        const text = (event.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    });
}

function configureUserInputPlaceholder() {
    const placeholderTarget = document.getElementById('user-input');

    placeholderTarget.addEventListener('input', checkPlaceholder(placeholderTarget));
    placeholderTarget.addEventListener('blur', checkPlaceholder(placeholderTarget));
}