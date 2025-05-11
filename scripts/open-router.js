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

// this will send requests to answer_pipline WOULD NOT WORK FOR NOW
async function useRagAnswerPipeline(messageText) {
    try {
        let body = [];

        // here change body for your endpoint if does not work
        body.push({'message': messageText, 'chat_engine': config.CHAT_ENGINE_FOR_RAG});
        let requestText = JSON.stringify(body);

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

        return await convertResponceToInnerFormat(response.json());
    } catch (error) {
        console.error('Endpoint Error:', error);
        throw error;
    }
}

// this will convert request result to the one simillar to openRouter's (with choices ...)
async function convertResponceToInnerFormat(responce) {
    return await responce['responce'];
}