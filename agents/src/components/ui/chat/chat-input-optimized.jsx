import React, { useRef, useCallback, memo, useState } from 'react';
import { Send, Loader2 } from "lucide-react";

export const ChatInputOptimized = memo(({ onSend, isLoading, placeholder }) => {
  const inputRef = useRef(null);
  const [hasText, setHasText] = useState(false);
  const [isMultiline, setIsMultiline] = useState(false);
  
  // Только для кнопки, обновляем по таймеру
  const handleInput = useCallback((e) => {
    const value = e.target.value;
    const trimmed = value.trim();
    
    // Оптимизация: обновляем состояние только если оно изменилось
    setHasText(prev => {
      const newHasText = trimmed.length > 0;
      return prev !== newHasText ? newHasText : prev;
    });
    
    // Определяем многострочность
    if (value.includes('\n') && !isMultiline) {
      setIsMultiline(true);
    }
  }, [isMultiline]);
  
  const handleSend = useCallback(() => {
    if (!inputRef.current) return;
    
    const value = inputRef.current.value.trim();
    if (value && !isLoading && onSend) {
      onSend(value);
      inputRef.current.value = '';
      setHasText(false);
      if (isMultiline) {
        setIsMultiline(false);
        // Возвращаем высоту к исходной
        inputRef.current.style.height = '44px';
      }
    }
  }, [onSend, isLoading, isMultiline]);
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);
  
  const handleTextareaInput = useCallback((e) => {
    handleInput(e);
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, [handleInput]);
  
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1">
        {isMultiline ? (
          <textarea
            ref={inputRef}
            placeholder={placeholder}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
            onInput={handleTextareaInput}
            className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto"
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        ) : (
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            disabled={isLoading}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            className="flex h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
        )}
      </div>
      
      <button
        onClick={handleSend}
        disabled={isLoading || !hasText}
        className="h-[44px] px-4 rounded-full flex-shrink-0 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span>Отправить</span>
      </button>
    </div>
  );
});

ChatInputOptimized.displayName = 'ChatInputOptimized';