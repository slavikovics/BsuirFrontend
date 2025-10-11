// components/schedule/schedule-types.js

// Типы занятий
export const LESSON_TYPES = {
  LECTURE: { 
    label: "Лекция", 
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
  },
  PRACTICAL: { 
    label: "Практика", 
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
  },
  LAB: { 
    label: "Лаб.", 
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" 
  },
  SEMINAR: { 
    label: "Семинар", 
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" 
  }
}

// Дни недели
export const DAYS_OF_WEEK = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]

// Размеры карточек
export const CARD_SIZES = {
  NORMAL: { width: 'w-64', class: 'w-64' },
  EXPANDED: { width: 'w-80', class: 'w-80' }
}

// Конфигурация перетягивания
export const DRAG_CONFIG = {
  MULTIPLIER: 2,
  CURSORS: {
    DEFAULT: 'grab',
    DRAGGING: 'grabbing'
  }
}