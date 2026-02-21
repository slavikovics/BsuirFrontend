import { memo, useRef, useEffect } from "react"
import { ScrollArea } from "../scroll-area"
import { Avatar, AvatarFallback } from "../avatar"
import { Bot, User, Loader2 } from "lucide-react"
import { SimpleMarkdownContent } from "../fixed-markdown-content"

export const ChatMessages = memo(({ messages, isLoading }) => {
  const scrollAreaRef = useRef(null)
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        setTimeout(() => {
          scrollContainer.scrollTop = scrollContainer.scrollHeight
        }, 100)
      }
    }
  }, [messages])
  
  return (
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
                className={`rounded-xl px-5 py-4 ${
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
                  <p className="text-sm md:text-base whitespace-pre-wrap w-full max-w-none break-words">
                    {message.content}
                  </p>
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
  )
})

ChatMessages.displayName = 'ChatMessages'