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
    messageElement.className = 'message bot';

    messageElement.style.backgroundColor = '#131926';
    chatContainer.appendChild(messageElement);

    AnimateExpansion(messageElement, message, chatContainer, "glowingBorderBlue");
}

document.getElementById('send-button').addEventListener('click', function() {
    const userInput = document.getElementById('user-input');
    const message = userInput.innerText.trim();
    
    if (message) {
        addUserMessageToChat(message);
        clearInput(userInput);
        addBotMessageToChat('Извините, я не могу ответить на этот вопрос.');
    }
});

document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const message = this.innerText.trim();
        clearInput(this);

        if (message) {
            addUserMessageToChat(message);
            addBotMessageToChat('Извините, я не могу ответить на этот вопрос.');
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

editableDiv.addEventListener('input', checkPlaceholder);
editableDiv.addEventListener('blur', checkPlaceholder);
