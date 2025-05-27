import { config } from "../config.js";

const endpointUrl = config.API_URL; 

export async function sendMessageToOpenRouter(messageText, chatHistory) {
    if (!config.USE_RAG_API) {
        return await sendDirectlyToOpenRouter(messageText);
    }
    
    // probably would not work
    return await useRagAnswerPipeline(messageText);
}

async function sendDirectlyToOpenRouter(messageText) {
    try {
        let bodyMessages = [];

        //chatHistory.forEach(element => {
            //bodyMessages.push({'role': 'user', 'content': element});
        //});
        //bodyMessages.reverse();

        bodyMessages.push({'role': 'user', 'content': messageText});
        let requestText = JSON.stringify(bodyMessages);at
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

async function useRagAnswerPipeline(messageText) {
    try {
        const response = await fetch(config.ANSWER_PIPELINE_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageText)
        });

        const rawText = await response.text();

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. Message: ${rawText}`);
        }

        const data = await JSON.parse(rawText);
        
        return convertResponseToMarkdownFormat(data);
    } catch (error) {
        console.error('Endpoint Error:', error);
        throw error;
    }
}

function convertResponseToMarkdownFormat(responseData) {
    const text = responseData.response || "Ответ пуст";
    const sources = responseData.source_urls || [];

    let markdownSources = "";
    if (sources.length > 0) {
        markdownSources += "\n\n### Источники:\n";
        sources.forEach((url) => {
            markdownSources += `- [Источник ${url}](${url})\n`;
        });
    }

    return {
        choices: [
            {
                message: {
                    role: "assistant",
                    content: text + markdownSources
                }
            }
        ]
    };
}