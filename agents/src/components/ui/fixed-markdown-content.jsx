// components/markdown/fixed-markdown-content.jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

/**
 * Красивый и универсальный компонент для отображения Markdown-ответов от LLM
 * Поддерживает все основные элементы Markdown с современными стилями
 */
export const SimpleMarkdownContent = ({ 
  content,
  className = '',
  compact = false
}) => {
  if (!content) return null;

  // Конфигурация стилей в зависимости от compact режима
  const styles = compact ? {
    h1: "text-xl font-bold mt-6 mb-4 text-gray-900 dark:text-white",
    h2: "text-lg font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200",
    h3: "text-base font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300",
    h4: "text-sm font-medium mt-3 mb-2 text-gray-600 dark:text-gray-400",
    p: "mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300",
    spacing: "space-y-1.5",
    blockquote: "my-4 pl-3 border-l-3 border-blue-400 bg-blue-50/20 dark:bg-blue-900/10 py-2 text-sm"
  } : {
    h1: "text-2xl font-bold mt-8 mb-6 text-gray-900 dark:text-white pb-2 border-b border-gray-200 dark:border-gray-700",
    h2: "text-xl font-semibold mt-7 mb-4 text-gray-800 dark:text-gray-200 relative pl-3 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-gradient-to-b before:from-blue-500 before:to-purple-500 before:rounded-full",
    h3: "text-lg font-medium mt-6 mb-3 text-gray-700 dark:text-gray-300",
    h4: "text-base font-medium mt-5 mb-2 text-gray-600 dark:text-gray-400",
    p: "mb-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300",
    spacing: "space-y-2",
    blockquote: "my-5 pl-4 border-l-4 border-gradient-to-b from-blue-400 to-purple-500 bg-gradient-to-r from-blue-50/30 to-purple-50/30 dark:from-gray-800/30 dark:to-gray-900/30 py-3 rounded-r-lg italic text-gray-600 dark:text-gray-400"
  };

  return (
    <div className={`${className} ${compact ? '' : 'prose prose-sm max-w-none dark:prose-invert'}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Заголовки
          h1: ({ children }) => (
            <h1 className={styles.h1}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className={styles.h2}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className={styles.h3}>{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className={styles.h4}>{children}</h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-sm font-medium mt-4 mb-2 text-gray-600 dark:text-gray-400">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-medium mt-3 mb-1 text-gray-500 dark:text-gray-500">
              {children}
            </h6>
          ),

          // Текстовые элементы
          p: ({ children }) => (
            <p className={styles.p}>{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-white bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 px-1 rounded">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-600 dark:text-gray-400">
              {children}
            </em>
          ),
          del: ({ children }) => (
            <del className="line-through text-gray-400 dark:text-gray-500">
              {children}
            </del>
          ),

          // Списки
          ul: ({ children }) => (
            <ul className={`mb-4 ml-4 ${styles.spacing}`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`mb-4 ml-4 ${styles.spacing} list-decimal`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-sm text-gray-700 dark:text-gray-300 pl-1 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-blue-400 before:rounded-full before:opacity-70">
              <span className="pl-3">{children}</span>
            </li>
          ),

          // Код
          code: ({ children, className, inline }) => {
            if (inline) {
              return (
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md text-xs font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                  {children}
                </code>
              );
            }
            
            const language = className?.replace('language-', '') || 'text';
            
            return (
              <div className="my-5 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {language}
                  </span>
                  <button 
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    onClick={() => navigator.clipboard.writeText(String(children))}
                  >
                    Копировать
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto bg-white dark:bg-gray-900 m-0">
                  <code className={`text-sm font-mono ${className}`}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },

          // Цитаты
          blockquote: ({ children }) => (
            <blockquote className={styles.blockquote}>
              {children}
            </blockquote>
          ),

          // Разделители
          hr: () => (
            <hr className="my-6 border-t border-gray-300 dark:border-gray-700 opacity-50" />
          ),

          // Ссылки
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline decoration-2 decoration-blue-300/30 hover:decoration-blue-400/50 transition-all duration-200"
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),

          // Изображения
          img: ({ src, alt }) => (
            <div className="my-6 flex justify-center">
              <div className="relative group">
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                  loading="lazy"
                />
                {alt && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-lg">
                    {alt}
                  </div>
                )}
              </div>
            </div>
          ),

          // Таблицы (через remark-gfm)
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
              {children}
            </td>
          ),

          // Списки задач (через remark-gfm)
          input: ({ checked, type }) => {
            if (type === 'checkbox') {
              return (
                <input 
                  type="checkbox" 
                  checked={checked || false} 
                  readOnly 
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
                />
              );
            }
            return null;
          },
          taskList: ({ children }) => (
            <ul className="space-y-3 my-4">
              {children}
            </ul>
          ),
          taskListItem: ({ children, checked }) => (
            <li className="flex items-start">
              <div className={`flex items-center h-5 mt-0.5 mr-3 ${checked ? 'text-green-500' : 'text-gray-400'}`}>
                {checked ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className={`text-sm ${checked ? 'text-gray-500 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-300'}`}>
                {children}
              </span>
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

/**
 * Компактная версия для использования в карточках и ограниченном пространстве
 */
export const CompactMarkdownContent = ({ content, className = '' }) => {
  return <SimpleMarkdownContent content={content} className={className} compact={true} />;
};

/**
 * Декоративная версия с акцентом на визуальную привлекательность
 */
export const DecorativeMarkdownContent = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Декоративные элементы */}
      <div className="absolute -left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
      
      <div className="ml-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold mt-5 mb-3 text-gray-800 dark:text-gray-200">
                <span className="relative inline-block">
                  {children}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400"></span>
                </span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-medium mt-4 mb-2 text-gray-700 dark:text-gray-300">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="mb-4 ml-4 space-y-2">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="text-sm text-gray-700 dark:text-gray-300 pl-2 flex items-start">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 mt-2 mr-2 flex-shrink-0"></span>
                <span>{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-4 pl-4 border-l-4 border-gradient-to-b from-blue-400 to-purple-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-gray-800/50 dark:to-gray-900/50 py-3 rounded-r-lg italic text-gray-600 dark:text-gray-400 relative">
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 text-4xl text-blue-300/30 dark:text-blue-600/20">"</div>
                <div className="pl-4">{children}</div>
              </blockquote>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};