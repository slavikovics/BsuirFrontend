import { useState, useRef, useEffect } from "react"
import { Button } from "../button"
import { Input } from "../input"
import { ScrollArea } from "../scroll-area"
import { Avatar, AvatarFallback } from "../avatar"
import { Tabs, TabsList, TabsTrigger } from "../tabs"
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

// Конфигурация API
const API_ENDPOINTS = {
  university: 'https://bsuirbot.site/api/',
}

export function Chat() {
  const [mode, setMode] = useState("university")
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

  // Загружаем историю при монтировании и смене режима
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

  // Функция для запроса к API университета
  const fetchUniversityAPI = async (messageText) => {
    try {
      const response = await fetch(API_ENDPOINTS.university, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: messageText
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      // Извлекаем поле response из ответа
      if (data && data.response) {
        return data.response
      } else {
        return "Получен ответ в неожиданном формате"
      }
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: Date.now(),
      mode
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    saveHistory(newMessages)
    setInput("")
    setIsLoading(true)
    setIsMultiline(false)

    try {
      let assistantResponse = ""
      
      if (mode === "university") {
        // Запрос к API университета
        assistantResponse = await fetchUniversityAPI(input)
      } else {
        // Для других режимов - имитация
        assistantResponse = await simulateAIResponse(input, mode)
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        role: "assistant",
        timestamp: Date.now(),
        mode
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      saveHistory(updatedMessages)
    } catch (error) {
      console.error("Ошибка получения ответа:", error)
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Извините, произошла ошибка при обработке запроса. Пожалуйста, попробуйте еще раз.",
        role: "assistant",
        timestamp: Date.now(),
        mode
      }
      
      const updatedMessages = [...newMessages, errorMessage]
      setMessages(updatedMessages)
      saveHistory(updatedMessages)
    } finally {
      setIsLoading(false)
    }
  }

  // Имитация ответов для режимов files и llm
  const simulateAIResponse = async (userMessage, mode) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    switch (mode) {
      case "files":
        const fileResponses = [
          "**Анализ документа**:\n\nВ загруженном документе я нашел информацию, которая может быть полезной:\n\n- Основные тезисы по вашей теме\n- Методические рекомендации\n- Примеры выполнения заданий",
          "На основе анализа файлов могу сказать:\n\n1. Документ содержит структурированную информацию\n2. Все требования к оформлению соблюдены\n3. Рекомендую обратить внимание на раздел с практическими примерами",
          "**Сводка по файлам**:\n\nВаши документы хорошо структурированы. Я выделил ключевые моменты:\n\n- Теоретическая часть: полная\n- Практическая часть: требует доработки\n- Список литературы: актуальный"
        ]
        return fileResponses[Math.floor(Math.random() * fileResponses.length)]
      
      case "llm":
        const llmResponses = [
          `Рассматривая ваш вопрос: "${userMessage}", могу предложить:\n\n**Решение 1**: Наиболее эффективный подход\n**Решение 2**: Альтернативный вариант\n**Решение 3**: Компромиссное решение`,
          "**Объяснение концепции**:\n\nДанная тема включает несколько важных аспектов. Основные из них:\n\n1. Фундаментальные принципы\n2. Практическое применение\n3. Возможные проблемы и решения",
          `Анализируя запрос, могу сказать:\n\nВопрос интересный и многогранный. Для полного понимания рекомендую:\n\n- Изучить базовые понятия\n- Рассмотреть практические примеры\n- Проанализировать кейсы применения`
        ]
        return llmResponses[Math.floor(Math.random() * llmResponses.length)]
      
      default:
        return "Получил ваш запрос, обрабатываю..."
    }
  }

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
          <ScrollArea className="h-full p-4 md:p-6" ref={scrollAreaRef}>
            <div className="space-y-6 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${
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
                    className={`rounded-lg px-4 py-3 max-w-[80%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <SimpleMarkdownContent 
                        content={message.content}
                        className="prose prose-sm max-w-none dark:prose-invert"
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                    
                    <p className={`text-xs mt-2 ${
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
                <div className="flex gap-4">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Думаю...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Фиксированная панель ввода */}
        <div className="border-t pt-4 pl-4 pr-4 bg-background">
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
                <textarea
                  ref={textareaRef}
                  placeholder={getPlaceholder()}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="w-full min-h-[44px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto"
                  rows={1}
                  style={{ height: '44px', maxHeight: '120px' }}
                />
              ) : (
                <Input
                  placeholder={getPlaceholder()}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="h-[44px]"
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