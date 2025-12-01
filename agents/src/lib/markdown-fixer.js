// lib/markdown-fixer.js
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';

/**
 * Исправляет только структурные проблемы Markdown используя библиотеки
 * Не меняет содержание, только исправляет синтаксис
 */
export const markdownFixer = {
  /**
   * Основная функция исправления Markdown
   * @param {string} markdown - Исходный Markdown текст
   * @returns {Promise<string>} Исправленный Markdown
   */
  async fix(markdown) {
    if (!markdown || typeof markdown !== 'string') {
      return markdown;
    }

    try {
      // Используем unified для нормализации структуры
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm) // Поддержка GitHub Flavored Markdown
        .use(() => (tree) => {
          // Минимальные AST исправления только для критических проблем
          this.fixCriticalASTIssues(tree);
        })
        .use(remarkStringify, {
          // Минимальные настройки, только для стабильности
          bullet: '*', // Оставляем как есть, но стандартизируем
          listItemIndent: 'one',
          emphasis: '*',
          strong: '*',
          fences: true,
          rule: '-',
        });

      const file = await processor.process(markdown);
      const result = String(file);
      
      // Применяем только самые необходимые текстовые исправления
      return this.fixCriticalTextIssues(result);
    } catch (error) {
      console.warn('Markdown fixing failed, returning original:', error);
      return markdown;
    }
  },

  /**
   * Исправляем только критические проблемы в AST
   * Не меняем маркеры списков и другие стилистические элементы
   */
  fixCriticalASTIssues(tree) {
    const walk = (node) => {
      if (!node || typeof node !== 'object') return;

      // Исправляем только самые критичные проблемы:

      // 1. Убираем пустые узлы
      if (node.type === 'text' && (!node.value || node.value.trim() === '')) {
        node.value = '';
      }

      // 2. Исправляем nested списки с неправильной структурой
      if (node.type === 'list') {
        this.normalizeListStructure(node);
      }

      // 3. Убираем пустые строки в кодовых блоках
      if (node.type === 'code' && node.value) {
        node.value = node.value.trim();
      }

      // 4. Убираем пробелы в начале/конце текстовых узлов
      if (node.type === 'text' && node.value) {
        // Сохраняем внутренние пробелы, только обрезаем края
        const trimmed = node.value.trim();
        if (trimmed !== node.value) {
          node.value = trimmed;
        }
      }

      // Рекурсивно обходим детей
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(walk);
      }
    };

    walk(tree);
  },

  /**
   * Нормализуем структуру списков (только критичные исправления)
   */
  normalizeListStructure(listNode) {
    if (!listNode.children || !Array.isArray(listNode.children)) return;

    // Проверяем и исправляем только явные ошибки вложенности
    listNode.children.forEach((item, index) => {
      if (!item.children) return;

      // Если в элементе списка есть другой список как первый ребенок
      // И они находятся на том же уровне - это ошибка
      if (item.children.length > 0 && item.children[0].type === 'list') {
        // Проверяем глубину вложенности
        const nestedList = item.children[0];
        if (nestedList.children) {
          // Нормализуем отступы вложенного списка
          this.normalizeNestedListIndentation(nestedList);
        }
      }
    });
  },

  /**
   * Нормализуем отступы во вложенных списках
   */
  normalizeNestedListIndentation(listNode) {
    if (!listNode.children) return;

    listNode.children.forEach(item => {
      // Убеждаемся, что каждый элемент списка имеет корректную структуру
      if (item.children) {
        item.children.forEach(child => {
          if (child.type === 'paragraph') {
            // Убираем лишние обертки параграфов в элементах списка
            this.flattenParagraphInListItem(child);
          }
        });
      }
    });
  },

  /**
   * Убираем лишние параграфы в элементах списка
   */
  flattenParagraphInListItem(paragraphNode) {
    if (!paragraphNode.children || paragraphNode.children.length !== 1) return;
    
    const child = paragraphNode.children[0];
    if (child.type === 'text') {
      // Если параграф содержит только текст, упрощаем структуру
      paragraphNode.type = 'text';
      paragraphNode.value = child.value;
      delete paragraphNode.children;
    }
  },

  /**
   * Исправляем только критические текстовые проблемы
   * которые не исправляются unified
   */
  fixCriticalTextIssues(text) {
    if (!text) return text;

    let fixed = text;

    // 1. Исправляем некорректные заголовки с лишними пробелами
    // (только если есть явная ошибка синтаксиса)
    fixed = fixed.replace(/^(#{1,6})\s\s+/gm, '$1 ');
    
    // 2. Убираем пробелы внутри форматирования только если они явно лишние
    // (** текст ** -> **текст**), но только если пробелы с обеих сторон
    fixed = fixed.replace(/\*\*\s+(\S(?:.*?\S)?)\s+\*\*/g, '**$1**');
    fixed = fixed.replace(/\*\s+(\S(?:.*?\S)?)\s+\*/g, '*$1*');
    
    // 3. Исправляем кодовые блоки с пустыми строками
    fixed = fixed.replace(/```\s*\n\s*\n/g, '```\n');
    fixed = fixed.replace(/\n\s*\n```/g, '\n```');
    
    // 4. Убираем лишние пустые строки (больше 2 подряд)
    fixed = fixed.replace(/\n{3,}/g, '\n\n');
    
    // 5. Исправляем inline код с пробелами
    fixed = fixed.replace(/`\s+(\S(?:.*?\S)?)\s+`/g, '`$1`');
    
    // 6. Нормализуем переводы строк
    fixed = fixed.replace(/\r\n/g, '\n');
    
    return fixed;
  },

  /**
   * Проверяет, есть ли критические ошибки, требующие исправления
   */
  hasCriticalIssues(text) {
    if (!text) return false;

    const criticalIssues = [
      /```\s*\n\s*\n/,          // Пустые строки в начале кодового блока
      /\n\s*\n```/,            // Пустые строки перед закрытием кодового блока
      /\*\*\s+\S.*\S\s+\*\*/,  // Пробелы внутри ** **
      /\*\s+\S.*\S\s+\*/,      // Пробелы внутри * *
      /`\s+\S.*\S\s+`/,        // Пробелы внутри ` `
      /\n{3,}/,                // Более 2 пустых строк подряд
      /^(#{1,6})\s\s+/,        // Двойные пробелы после #
    ];

    return criticalIssues.some(pattern => pattern.test(text));
  }
};

/**
 * Альтернативная реализация с использованием remark-parse и remark-stringify
 * без дополнительных преобразований
 */
export const minimalMarkdownFixer = {
  async fix(markdown) {
    if (!markdown) return markdown;

    try {
      // Просто парсим и рендерим обратно - unified сам нормализует синтаксис
      const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkStringify);

      const file = await processor.process(markdown);
      return String(file);
    } catch (error) {
      console.warn('Minimal markdown fix failed:', error);
      return markdown;
    }
  }
};