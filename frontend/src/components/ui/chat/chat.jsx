import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react"
import { Button } from "../button"
import { Tabs, TabsList, TabsTrigger } from "../tabs"
import { Trash2, Building, FileText, Brain } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip"
import { useChatAPI } from "./use-chat"
import { ChatMessages } from "./chat-messages"
import { ChatInputOptimized } from "./chat-input-optimized"

const storageKeys = {
  university: "university-chat-history",
  files: "files-chat-history", 
  llm: "llm-chat-history"
}

const initialMessages = {
  university: [
    {
      id: "1",
      content: "Привет! Я ваш университетский помощник. Задавайте вопросы об университете, расписании, преподавателях и экзаменах.",
      role: "assistant",
      timestamp: Date.now(),
      mode: "university"
    }
  ],
  files: [
    {
      id: "2",
      content: "Загрузите файлы через меню, и я помогу вам с их анализом.",
      role: "assistant",
      timestamp: Date.now(),
      mode: "files"
    }
  ],
  llm: [
    {
      id: "3",
      content: "Привет! Я AI-ассистент. Могу помочь с различными вопросами и задачами.",
      role: "assistant",
      timestamp: Date.now(),
      mode: "llm"
    }
  ]
}

const getPlaceholder = (mode) => {
  switch (mode) {
    case "university": return "Задайте вопрос об университете..."
    case "files": return "Задайте вопрос по загруженным файлам..."
    case "llm": return "Задайте любой вопрос..."
    default: return "Введите сообщение..."
  }
}

// Мемоизированные компоненты для табов
const TabItems = memo(({ mode, setMode }) => (
  <TabsList className="grid grid-cols-3 w-full">
    <TabsTrigger value="university" className="gap-2">
      <Building className="h-4 w-4" />
      Университет
    </TabsTrigger>
    <TabsTrigger value="files" className="gap-2">
      <FileText className="h-4 w-4" />
      Знания пользователя
    </TabsTrigger>
    <TabsTrigger value="llm" className="gap-2">
      <Brain className="h-4 w-4" />
      LLM
    </TabsTrigger>
  </TabsList>
))

TabItems.displayName = 'TabItems'

const ClearHistoryButton = memo(({ clearHistory }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={clearHistory}
          className="h-[44px] w-[44px] flex-shrink-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Очистить историю</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
))

ClearHistoryButton.displayName = 'ClearHistoryButton'

export function Chat() {
  const [mode, setMode] = useState("university")
  const [messages, setMessages] = useState(initialMessages.university)
  const [isLoading, setIsLoading] = useState(false)
  
  const { sendMessage } = useChatAPI();
  
  // Загрузка истории
  useEffect(() => {
    const saved = localStorage.getItem(storageKeys[mode])
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setMessages(Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMessages[mode])
      } catch {
        setMessages(initialMessages[mode])
      }
    } else {
      setMessages(initialMessages[mode])
    }
  }, [mode])
  
  const saveHistory = useCallback((messagesToSave) => {
    try {
      localStorage.setItem(storageKeys[mode], JSON.stringify(messagesToSave))
    } catch (err) {
      console.error("Ошибка сохранения истории:", err)
    }
  }, [mode])
  
  const clearHistory = useCallback(() => {
    if (confirm("Очистить историю сообщений?")) {
      setMessages(initialMessages[mode])
      localStorage.removeItem(storageKeys[mode])
    }
  }, [mode])
  
  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim() || isLoading) return;
    
    const userMessage = {
      id: `${Date.now()}_user`,
      content: messageText,
      role: 'user',
      timestamp: Date.now(),
      mode
    };
    
    // Оптимизация: не создаем новый массив каждый раз
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    
    try {
      const response = await sendMessage(messageText, mode);
      
      const assistantMessage = {
        id: `${Date.now()}_assistant`,
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
        mode
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      saveHistory(finalMessages);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: `${Date.now()}_error`,
        content: `Ошибка: ${error.message}`,
        role: 'assistant',
        timestamp: Date.now(),
        mode
      };
      
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, mode, isLoading, sendMessage, saveHistory])
  
  // Мемоизируем пропсы
  const messagesProps = useMemo(() => ({ messages, isLoading }), [messages, isLoading])
  const inputProps = useMemo(() => ({
    onSend: handleSendMessage,
    isLoading,
    placeholder: getPlaceholder(mode)
  }), [handleSendMessage, isLoading, mode])
  
  return (
    <div className="w-full h-full">
      <div className="h-[calc(100vh-80px)] flex flex-col bg-background">
        {/* Фиксированная шапка с табами */}
        <div className="border-b px-6 py-3 bg-background">
          <Tabs 
            value={mode} 
            onValueChange={setMode}
            className="w-full"
          >
            <TabItems mode={mode} setMode={setMode} />
          </Tabs>
        </div>
        
        {/* Сообщения */}
        <ChatMessages {...messagesProps} />
        
        {/* Панель ввода */}
        <div className="border-t w-full pt-2 bg-background">
          <div className="flex w-full items-center gap-2 max-w-4xl mx-auto">
            <ClearHistoryButton clearHistory={clearHistory} />
            
            <div className="flex-1">
              <ChatInputOptimized {...inputProps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}