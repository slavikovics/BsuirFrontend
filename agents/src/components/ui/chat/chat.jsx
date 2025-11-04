// components/chat/chat.jsx
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { ScrollArea } from "../scroll-area";
import { Send, Trash2, Bot, User } from "lucide-react";

export const Chat = () => {
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

  const handleSendMessage = async () => {
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
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChatHistory = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content: "Здравствуйте! Я ассистент по университету. Как я могу помочь вам сегодня?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    localStorage.removeItem("university-chat-history");
  };

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

  // Компонент для рендеринга сообщений
  const ChatMessage = ({ message, isLatest }) => {
    const messageRef = useRef(null);
    const isUser = message.role === "user";

    useEffect(() => {
      if (isLatest && messageRef.current) {
        messageRef.current.scrollIntoView({ 
          behavior: "smooth",
          block: "nearest"
        });
      }
    }, [isLatest]);

    return (
      <div
        ref={messageRef}
        className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Аватар */}
        <div
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-blue-500 text-white"
          }`}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        {/* Сообщение */}
        <div
          className={`flex-1 max-w-[80%] ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <div
            className={`inline-block px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-primary text-primary-foreground rounded-tr-none"
                : "bg-muted text-foreground rounded-tl-none"
            } transition-all duration-300 animate-in fade-in-0 slide-in-from-bottom-2`}
          >
            {message.type === "loading" ? (
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                {message.content}
              </div>
            )}
          </div>
          
          {/* Время */}
          <div
            className={`text-xs text-muted-foreground mt-1 ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        {/* Заголовок и управление */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">RAG-чат</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Задайте вопрос о ваших занятиях, расписании или учебных материалах
            </p>
          </div>
          <Button
            variant="outline"
            onClick={clearChatHistory}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Очистить историю
          </Button>
        </div>

        {/* Контейнер чата */}
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 p-0 flex flex-col">
            {/* Область сообщений */}
            <ScrollArea 
              ref={chatContainerRef}
              className="flex-1 p-4"
            >
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isLatest={index === messages.length - 1}
                  />
                ))}
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            {/* Индикатор загрузки */}
            {isLoading && (
              <div className="px-4 py-2 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span>Ассистент печатает...</span>
                </div>
              </div>
            )}

            {/* Поле ввода */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Задайте вопрос о ваших занятиях, расписании или учебных материалах..."
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isLoading}
                  size="icon"
                  className="flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};