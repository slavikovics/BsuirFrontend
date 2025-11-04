// components/chat/markdown-renderer.jsx
import React, { useEffect, useRef } from "react";

export const MarkdownRenderer = ({ content }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    // Базовая обработка markdown (можно заменить на более продвинутую библиотеку)
    if (contentRef.current) {
      // Простая замена markdown на HTML
      let html = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code class="inline-code">$1</code>')
        .replace(/\n/g, '<br>');

      contentRef.current.innerHTML = html;
    }
  }, [content]);

  return (
    <div
      ref={contentRef}
      className="prose prose-sm max-w-none dark:prose-invert prose-headings:mt-2 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1"
    >
      {content}
    </div>
  );
};