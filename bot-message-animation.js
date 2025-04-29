export function animateHtmlExpansion(messageElement, innerHTML, chatContainer, animationName) {
  disableScroll();
  // Сброс стилей
  messageElement.innerHTML = '';
  messageElement.style.display = 'block';
  messageElement.style.overflow = 'visible';
  messageElement.style.whiteSpace = 'normal';
  messageElement.style.opacity = '1';

  // Парсинг HTML и преобразование текстовых узлов в элементы
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

  // Постепенное добавление с анимацией
  let index = 0;
  const addNextElement = () => {
    if (index >= elements.length) return;

    const element = elements[index].cloneNode(true);
    if (animationName) {
      element.classList.add(animationName); // Добавляем класс анимации
      element.style.opacity = '0'; // Начальное состояние для анимации
    }

    messageElement.appendChild(element);
    
    // Форсируем обновление анимации
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });

    index++;
    smoothScrollToBottom(chatContainer);
    setTimeout(addNextElement, 90);
  };

  addNextElement();
  smoothScrollToBottom(chatContainer);
  enableScroll();
}

function disableScroll() {
    // Запрещаем скролл колесом мыши и тач-событиями
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    
    // Блокировка скролла на мобильных устройствах (доп. защита)
    document.addEventListener('touchmove', preventScroll, { passive: false });
    document.addEventListener('wheel', preventScroll, { passive: false });
}

function enableScroll() {
    // Возвращаем скролл
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
    
    // Удаляем обработчики
    document.removeEventListener('touchmove', preventScroll);
    document.removeEventListener('wheel', preventScroll);
}

function preventScroll(e) {
    e.preventDefault();
    e.stopPropagation();
    return false;
}

export function smoothScrollToBottom(container) {
  container.scrollTo({
    top: container.scrollHeight,
    behavior: 'smooth'
  });
}