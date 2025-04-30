export async function sendMessageToOpenRouter(messageText, chatHistory) {
    const endpointUrl = 'https://api.bsuirbot.site/Bsuir?modelId=0';  

    try {
        let bodyMessages = [];
        //chatHistory.forEach(element => {
            //bodyMessages.push({'role': 'user', 'content': element});
        //});
        //bodyMessages.reverse();

        bodyMessages.push({'role': 'user', 'content': messageText});
        let requestText = JSON.stringify(bodyMessages);
        console.log(requestText);
        console.log("Request text: " + requestText);

        const response = await fetch(endpointUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: requestText
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