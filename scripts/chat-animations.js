export function removeAnimationsForPreviousBlocks(chatContainer) {
    const children = chatContainer.children;
    if (!children) return;

    for (let child of children) {
        child.style.animation = 'none';
    }
}

export function checkPlaceholder(div) {
    if (div.innerText === '') {
        div.classList.add('empty');

    } else {
        div.classList.remove('empty');
    }
}

export function clearInput(userInput){
    setTimeout(() => {
        userInput.innerHTML = '';
    }, 5);
}