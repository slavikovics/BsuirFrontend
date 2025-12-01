import { useState } from "react"
import { Button } from "../button"
import { Input } from "../input"
import { Send, Paperclip, Smile } from "lucide-react"

export function ChatInput({ onSend, isLoading, mode }) {
  const [input, setInput] = useState("")
  const [isMultiline, setIsMultiline] = useState(false)

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input)
      setInput("")
      if (isMultiline) setIsMultiline(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (e.shiftKey) {
        // Shift+Enter - новая строка
        if (!isMultiline) setIsMultiline(true)
      } else {
        // Enter - отправка
        e.preventDefault()
        handleSend()
      }
    }
  }

  const getPlaceholder = () => {
    switch (mode) {
      case "university":
        return "Задайте вопрос об университете..."
      case "files":
        return "Задайте вопрос по вашим файлам..."
      case "llm":
        return "Задайте любой вопрос..."
      default:
        return "Введите сообщение..."
    }
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <div className="flex gap-2 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMultiline(!isMultiline)}
              className="h-8 w-8 p-0"
            >
              {isMultiline ? "↲" : "↵"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Paperclip className="h-4 w-4" />
            </Button>
          </div>
          {isMultiline ? (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              rows={3}
              disabled={isLoading}
            />
          ) : (
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder()}
              className="min-h-[44px]"
              disabled={isLoading}
            />
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {isMultiline 
              ? "Нажмите Enter для новой строки, Ctrl+Enter для отправки" 
              : "Нажмите Enter для отправки, Shift+Enter для многострочного режима"}
          </p>
        </div>
        <Button 
          onClick={handleSend} 
          disabled={isLoading || !input.trim()}
          className="h-[44px] px-6"
        >
          <Send className="h-4 w-4 mr-2" />
          Отправить
        </Button>
      </div>
    </div>
  )
}