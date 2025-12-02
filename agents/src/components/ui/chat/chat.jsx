import { useState, useRef, useEffect } from "react"
import { Button } from "../button"
import { Input } from "../input"
import { ScrollArea } from "../scroll-area"
import { Avatar, AvatarFallback } from "../avatar"
import { Tabs, TabsList, TabsTrigger } from "../tabs"
import { UncontrolledInput } from "./uncontrolled-input"
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Trash2, 
  Building,
  FileText,
  Brain
} from "lucide-react"
import { SimpleMarkdownContent } from "../fixed-markdown-content"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip"
import { useChatAPI } from "./use-chat"

// Конфигурация API
const API_ENDPOINTS = {
  university: 'https://bsuirbot.site/api/',
}

export function Chat() {
  const [mode, setMode] = useState("university")
  const { sendMessage } = useChatAPI();
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMultiline, setIsMultiline] = useState(false)
  const scrollAreaRef = useRef(null)
  const textareaRef = useRef(null)

  const storageKeys = {
    university: "university-chat-history",
    files: "files-chat-history", 
    llm: "llm-chat-history"
  }


  useEffect(() => {
    const saved = localStorage.getItem(storageKeys[mode])
    if (saved) {
      try {
        setMessages(JSON.parse(saved))
      } catch (err) {
        console.error("Ошибка загрузки истории:", err)
        setMessages(getInitialMessages(mode))
      }
    } else {
      setMessages(getInitialMessages(mode))
    }
  }, [mode])

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Автоматическое определение многострочного режима
  useEffect(() => {
    const hasNewLine = input.includes('\n')
    if (hasNewLine !== isMultiline) {
      setIsMultiline(hasNewLine)
    }
    
    // Авторазмер textarea
    if (textareaRef.current && isMultiline) {
      textareaRef.current.style.height = 'auto'
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120)
      textareaRef.current.style.height = newHeight + 'px'
    }
  }, [input, isMultiline])

  const getInitialMessages = (mode) => {
    switch (mode) {
      case "university":
        return [
          {
            id: "1",
            content: "Привет! Я ваш университетский помощник. Задавайте вопросы об университете, расписании, преподавателях и экзаменах.",
            role: "assistant",
            timestamp: Date.now(),
            mode: "university"
          }
        ]
      case "files":
        return [
          {
            id: "2",
            content: "Загрузите файлы через меню, и я помогу вам с их анализом.",
            role: "assistant",
            timestamp: Date.now(),
            mode: "files"
          }
        ]
      case "llm":
        return [
          {
            id: "3",
            content: "Привет! Я AI-ассистент. Могу помочь с различными вопросами и задачами.",
            role: "assistant",
            timestamp: Date.now(),
            mode: "llm"
          }
        ]
      default:
        return []
    }
  }

  const saveHistory = (messagesToSave) => {
    try {
      localStorage.setItem(storageKeys[mode], JSON.stringify(messagesToSave))
    } catch (err) {
      console.error("Ошибка сохранения истории:", err)
    }
  }

  const clearHistory = () => {
    if (confirm("Очистить историю сообщений?")) {
      setMessages(getInitialMessages(mode))
      localStorage.removeItem(storageKeys[mode])
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: Date.now(),
      mode
    };

    let newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsMultiline(false)
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendMessage(input, mode);
      
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: Date.now(),
        mode
      };

      setMessages([...newMessages, assistantMessage]);
      newMessages = [...newMessages, assistantMessage];
      saveHistory(newMessages);
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error.message}`,
        role: 'assistant',
        timestamp: Date.now(),
        mode
      };
      
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getPlaceholder = () => {
    switch (mode) {
      case "university":
        return "Задайте вопрос об университете..."
      case "files":
        return "Задайте вопрос по загруженным файлам..."
      case "llm":
        return "Задайте любой вопрос..."
      default:
        return "Введите сообщение..."
    }
  }

  return (
    <div className="w-full h-full">
      {/* СОБСТВЕННЫЙ КОНТЕЙНЕР С ЛОГИКОЙ КАРТОЧКИ */}
      <div className="h-[calc(100vh-80px)] flex flex-col bg-background">
        {/* Фиксированная шапка с табами */}
        <div className="border-b px-6 py-3 bg-background">
          <Tabs 
            value={mode} 
            onValueChange={setMode}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="university" className="gap-2">
                <Building className="h-4 w-4" />
                Университет
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-2">
                <FileText className="h-4 w-4" />
                Мои файлы
              </TabsTrigger>
              <TabsTrigger value="llm" className="gap-2">
                <Brain className="h-4 w-4" />
                Общий AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
{/* Область сообщений - КРИТИЧЕСКИ ВАЖНЫЙ CSS */}
<div className="flex-1 p-0 overflow-hidden">
  <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
    <div className="p-4 md:p-6 lg:p-8 space-y-6 w-full">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-4 w-full ${
            message.role === "user" ? "flex-row-reverse" : ""
          }`}
        >
          <Avatar className="h-8 w-8 flex-shrink-0">
            {message.role === "assistant" ? (
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            ) : (
              <AvatarFallback className="bg-muted">
                <User className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <div
            className={`rounded-xl px-5 py-4 w-full max-w-[75vw] ${
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-card border border-border shadow-sm"
            }`}
            style={{
              width: 'fit-content',
              maxWidth: '75vw',
            }}
          >
            {message.role === "assistant" ? (
              <SimpleMarkdownContent 
                content={message.content}
                className="w-full max-w-none"
              />
            ) : (
              <p className="text-sm md:text-base whitespace-pre-wrap w-full max-w-none break-words">{message.content}</p>
            )}
            
            <p className={`text-xs mt-3 ${
              message.role === "user" 
                ? "text-primary-foreground/70" 
                : "text-muted-foreground"
            }`}>
              {new Date(message.timestamp).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </p>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-4 w-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10">
              <Bot className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          <div 
            className="rounded-xl px-5 py-4 bg-card border border-border shadow-sm"
            style={{
              width: 'fit-content',
              maxWidth: '50vw',
            }}
          >
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm md:text-base font-medium">Думаю...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </ScrollArea>
</div>

{/* Фиксированная панель ввода */}
<div className="border-t w-full pt-2 bg-background">
  <div className="flex w-full items-center gap-2 max-w-4xl mx-auto">
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
    
    <div className="flex-1">
      {isMultiline ? (
        <UncontrolledTextarea
          placeholder={getPlaceholder()}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          onSubmit={(value) => setInput(value)}
          initialValue={input}
        />
      ) : (
        <UncontrolledInput
          placeholder={getPlaceholder()}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          onSubmit={(value) => setInput(value)}
          initialValue={input}
        />
      )}
    </div>
    
    
            
            <Button 
  onClick={handleSend} 
  disabled={isLoading || !input.trim()}
  className="h-[44px] px-4 rounded-full flex-shrink-0 gap-2"
>
  {isLoading ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Send className="h-4 w-4" />
  )}
  <span>Отправить</span>
</Button>
          </div>
        </div>
      </div>
    </div>
  )
}