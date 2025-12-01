// components/markdown/fixed-markdown-content.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Простой компонент Markdown без обработки
 * Использует только стандартные библиотеки для рендеринга
 */
export const SimpleMarkdownContent = ({ 
  content,
  className = ''
}) => {
  if (!content) return null;

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Минимальные стили, только для читаемости
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-medium mt-3 mb-2 text-gray-600 dark:text-gray-400">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-3 ml-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-3 ml-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 dark:text-gray-300">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-600 dark:text-gray-400">
              {children}
            </em>
          ),
          code: ({ children, inline }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto my-3">
                <code className="text-sm">{children}</code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-3 border-blue-400 pl-4 my-4 italic text-gray-600 dark:text-gray-400">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};