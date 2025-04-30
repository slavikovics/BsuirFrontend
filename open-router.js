export async function sendMessageToOpenRouter(messageText, chatHistory) {
    const endpointUrl = 'https://api.bsuirbot.site/Bsuir?modelId=1';  

    try {
        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify("ЗАПРОС ОТ ПОЛЬЗОВАТЕЛЯ НА КОТОРЫЙ ТЫ ДОЛЖЕН ОТВЕТИТЬ: " + messageText + "; СТАРЫЕ СООБЩЕНИЯ ОТ ПОЛЬЗОВАТЕЛЯ (МОЖНО И ИГНОРИРОВАТЬ): " + chatHistory.toString()),
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