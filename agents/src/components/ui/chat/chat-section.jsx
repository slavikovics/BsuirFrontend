// components/chat/chat-section.jsx
import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { ScrollArea } from "../scroll-area";
import { Send, Trash2, Bot, User } from "lucide-react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat } from "./use-chat";

export const ChatSection = () => {
  const {
    messages,
    input,
    isLoading,
    messageEndRef,
    chatContainerRef,
    handleInputChange,
    handleSendMessage,
    handleKeyPress,
    clearChatHistory
  } = useChat();

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
              <ChatInput
                value={input}
                onChange={handleInputChange}
                onSend={handleSendMessage}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder="Задайте вопрос о ваших занятиях, расписании или учебных материалах..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};