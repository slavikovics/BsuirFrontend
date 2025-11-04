// components/chat/chat-input.jsx
import React from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Send } from "lucide-react";

export const ChatInput = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled,
  placeholder
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onKeyPress(e);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        onClick={onSend}
        disabled={!value.trim() || disabled}
        size="icon"
        className="flex-shrink-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
};