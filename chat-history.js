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

export function shouldGreetUser() {
    if (loadChatHistory().length == 0) return true;

    const now = new Date().getTime();
    const lastGreetingTime = parseInt(localStorage.getItem('greetingTime') || 0);
    const tenMinutesInMs = 10 * 60 * 1000;
    
    const shouldShowGreeting = (now - lastGreetingTime) > tenMinutesInMs;
    localStorage.setItem('greetingTime', now.toString());
    
    return shouldShowGreeting;
}