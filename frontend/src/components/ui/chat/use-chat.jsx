const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081"

const callChatEndpoint = async (message, mode) => {
  try {
    const token = localStorage.getItem("jwt_token");
    
    if (!token) {
      throw new Error("Authentication required. Please login.");
    }

    const endpoint = `${API_BASE_URL}/api/chat/${mode}`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json', 
      },
      body: JSON.stringify({request: message})
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);
        return data.message || data;
    }
    
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }
    
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText || 'Unknown error'}`);
    
  } catch (error) {
    console.error(`Error in ${mode} chat:`, error);
    throw error;
  }
};

// Конкретные функции для каждого режима
const fetchUniversityChat = async (message) => {
  return callChatEndpoint(message, 'university');
};

const fetchFilesChat = async (message) => {
  return callChatEndpoint(message, 'files');
};

const fetchLlmChat = async (message) => {
  return callChatEndpoint(message, 'llm');
};

// Хук для использования в компонентах
export const useChatAPI = () => {
  const sendMessage = async (message, mode) => {
    switch (mode) {
      case 'university':
        return fetchUniversityChat(message);
      case 'files':
        return fetchFilesChat(message);
      case 'llm':
        return fetchLlmChat(message);
      default:
        throw new Error(`Unknown chat mode: ${mode}`);
    }
  };

  return {
    sendMessage,
    fetchUniversityChat,
    fetchFilesChat,
    fetchLlmChat
  };
};