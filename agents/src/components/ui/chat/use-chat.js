// components/chat/use-chat.js
import { useState, useRef, useEffect, useCallback } from "react";

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messageEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Загрузка истории при монтировании
  useEffect(() => {
    const savedMessages = loadChatHistory();
    if (savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      // Приветственное сообщение
      setMessages([
        {
          id: Date.now(),
          role: "assistant",
          content: "Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, []);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleInputChange = (value) => {
    setInput(value);
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Добавляем сообщение пользователя
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Добавляем индикатор загрузки
    const loadingMessage = {
      id: Date.now() + 1,
      role: "assistant",
      type: "loading",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Имитация API-запроса
      const response = await simulateApiCall(input.trim());
      
      // Убираем индикатор загрузки и добавляем ответ
      setMessages(prev => 
        prev.filter(msg => msg.type !== "loading").concat({
          id: Date.now() + 2,
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      );

      // Сохраняем в историю
      saveChatHistory([
        ...messages.filter(msg => msg.type !== "loading"),
        userMessage,
        {
          id: Date.now() + 2,
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
      setMessages(prev => 
        prev.filter(msg => msg.type !== "loading").concat({
          id: Date.now() + 2,
          role: "assistant",
          content: "Извините, произошла ошибка. Пожалуйста, попробуйте еще раз.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      );
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const clearChatHistory = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: "Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    localStorage.removeItem("university-chat-history");
  }, []);

  // Функции для работы с localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem("university-chat-history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const saveChatHistory = (newMessages) => {
    try {
      // Сохраняем только последние 50 сообщений
      const messagesToSave = newMessages.slice(-50);
      localStorage.setItem("university-chat-history", JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Ошибка при сохранении истории:", error);
    }
  };

  // Имитация API-запроса
  const simulateApiCall = async (message) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const responses = [
      "На основе вашего расписания, рекомендую обратить внимание на подготовку к предстоящим занятиям.",
      "Согласно учебному плану, у вас запланированы практические работы на следующей неделе.",
      "Я нашел информацию по вашему вопросу в учебных материалах. Вот что могу сказать...",
      "Учитывая ваше текущее расписание, оптимальное время для подготовки - вечерние часы.",
      "По этому вопросу есть несколько полезных источников в разделе 'Знания'."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return {
    messages,
    input,
    isLoading,
    messageEndRef,
    chatContainerRef,
    handleInputChange,
    handleSendMessage,
    handleKeyPress,
    clearChatHistory
  };
};