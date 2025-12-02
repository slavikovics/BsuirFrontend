// components/chat/uncontrolled-input.jsx
import React, { useRef, useEffect, useCallback } from 'react';

export const UncontrolledInput = React.memo(({
  placeholder,
  onKeyDown,
  disabled,
  onSubmit,
  initialValue = '',
  className = ''
}) => {
  const inputRef = useRef(null);
  const lastSubmittedValue = useRef(initialValue);
  
  // Инициализация значения
  useEffect(() => {
    if (inputRef.current && initialValue !== lastSubmittedValue.current) {
      inputRef.current.value = initialValue;
      lastSubmittedValue.current = initialValue;
    }
  }, [initialValue]);
  
  // Обработчик отправки
  const handleSubmit = useCallback(() => {
    if (inputRef.current) {
      const value = inputRef.current.value.trim();
      if (value && onSubmit) {
        onSubmit(value);
        inputRef.current.value = '';
        lastSubmittedValue.current = '';
      }
    }
  }, [onSubmit]);
  
  // Обработчик клавиш
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [handleSubmit, onKeyDown]);
  
  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      className={`flex h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      // Отключаем все браузерные фичи для максимальной производительности
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
});

UncontrolledInput.displayName = 'UncontrolledInput';

export const UncontrolledTextarea = React.memo(({
  placeholder,
  onKeyDown,
  disabled,
  onSubmit,
  initialValue = '',
  className = ''
}) => {
  const textareaRef = useRef(null);
  const lastSubmittedValue = useRef(initialValue);
  
  // Инициализация значения
  useEffect(() => {
    if (textareaRef.current && initialValue !== lastSubmittedValue.current) {
      textareaRef.current.value = initialValue;
      lastSubmittedValue.current = initialValue;
    }
  }, [initialValue]);
  
  // Автоматическое изменение высоты
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    textarea.style.height = '44px';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = `${newHeight}px`;
  }, []);
  
  // Обработчик отправки
  const handleSubmit = useCallback(() => {
    if (textareaRef.current) {
      const value = textareaRef.current.value.trim();
      if (value && onSubmit) {
        onSubmit(value);
        textareaRef.current.value = '';
        lastSubmittedValue.current = '';
        adjustHeight();
      }
    }
  }, [onSubmit, adjustHeight]);
  
  // Обработчик клавиш
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [handleSubmit, onKeyDown, disabled]);
  
  // Обработчик изменения текста
  const handleInput = useCallback(() => {
    adjustHeight();
  }, [adjustHeight]);
  
  return (
    <textarea
      ref={textareaRef}
      placeholder={placeholder}
      disabled={disabled}
      onKeyDown={handleKeyDown}
      onInput={handleInput}
      className={`w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto ${className}`}
      rows={1}
      // Отключаем все браузерные фичи для максимальной производительности
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
    />
  );
});

UncontrolledTextarea.displayName = 'UncontrolledTextarea';