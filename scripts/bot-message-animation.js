import { highlightAllCodeBlocks } from "./markdown.js";

export function animateHtmlExpansion(messageElement, innerHTML, chatContainer, animationName, smooth = true) {
	disableScroll();
	
	messageElement.innerHTML = '';
	messageElement.style.display = 'block';
	messageElement.style.overflow = 'visible';
	messageElement.style.whiteSpace = 'normal';
	messageElement.style.opacity = '1';

	const temp = document.createElement('div');
	temp.innerHTML = innerHTML;
	const elements = Array.from(temp.childNodes).map(node => {
		if (node.nodeType === Node.TEXT_NODE) {
			const span = document.createElement('span');
			span.textContent = node.textContent;
			return span;
		} else {
			return node;
		}
	});

	let index = 0;
	const addNextElement = () => {
		if (index >= elements.length) {
			highlightAllCodeBlocks();
			enableScroll();
			return;
		} 

		const element = elements[index].cloneNode(true);
		if (animationName) {
			element.classList.add(animationName);
			element.style.opacity = '0';
		}

		messageElement.appendChild(element);
		
		requestAnimationFrame(() => {
			element.style.opacity = '1';
		});

		index++;
		if (smooth) smoothScrollToBottom(chatContainer);
		else fastScrollToBottom(container);
		setTimeout(addNextElement, 200); 
	};

	addNextElement();
	if (smooth) smoothScrollToBottom(chatContainer);
	else fastScrollToBottom(chatContainer);
}

export function buildFillerContent(){
	return `<span class="btn-spinner">
            	<span class="spinner-dot-blue"></span>
            	<span class="spinner-dot-blue"></span>
            	<span class="spinner-dot-blue"></span>
            </span>`;
}

function disableScroll() {
		document.body.style.overflow = 'hidden';
		document.body.style.touchAction = 'none';
		
		document.addEventListener('touchmove', preventScroll, { passive: false });
		document.addEventListener('wheel', preventScroll, { passive: false });
}

function enableScroll() {
	document.body.style.overflow = '';
	document.body.style.touchAction = '';
		
	document.removeEventListener('touchmove', preventScroll);
	document.removeEventListener('wheel', preventScroll);
}

function preventScroll(e) {
	e.preventDefault();
	e.stopPropagation();
	return false;
}

function smoothScrollToBottom(container) {
	container.scrollTo({
		top: container.scrollHeight,
		behavior: 'smooth'
	});
}

export function fastScrollToBottom(container) {
	container.scrollTop = container.scrollHeight;
}

