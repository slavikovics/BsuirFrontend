export function saveMessage(message) {
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    
    messages.push({text: message});
  
    if (messages.length > 200) {
        messages = messages.slice(-200);
    }
    
    localStorage.setItem('chatMessages', JSON.stringify(messages));
}

export function loadChatHistory(){
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    return messages;
}

export function clearChatHistory() {
    localStorage.removeItem('chatMessages');
    location.reload(true);
}

export function setGreetingTime() {
    const now = new Date().getTime(); // Текущее время в мс
    const lastGreetingTime = parseInt(localStorage.getItem('greetingTime') || 0);
    const tenMinutesInMs = 10 * 60 * 1000; // 10 минут в миллисекундах
    
    // Проверяем, прошло ли более 10 минут
    const shouldShowGreeting = (now - lastGreetingTime) > tenMinutesInMs;
    
    // Обновляем время в любом случае
    localStorage.setItem('greetingTime', now.toString());
    
    return shouldShowGreeting;
}