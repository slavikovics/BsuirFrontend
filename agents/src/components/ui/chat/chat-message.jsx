// components/chat/chat-message.jsx
import React, { useEffect, useRef } from "react";
import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";

export const ChatMessage = ({ message, isLatest }) => {
  const messageRef = useRef(null);

  useEffect(() => {
    if (isLatest && messageRef.current) {
      messageRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "nearest"
      });
    }
  }, [isLatest]);

  const isUser = message.role === "user";

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
            <MarkdownRenderer content={message.content} />
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