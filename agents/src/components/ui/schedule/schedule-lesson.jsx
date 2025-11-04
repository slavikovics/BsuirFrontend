// components/schedule/schedule-lesson.jsx
import React from "react";
import { Button } from "../button";
import { Plus, Clock, MapPin, User } from "lucide-react";
import { LESSON_TYPES } from "./schedule-types";
import { TaskBadge } from "./task-badge";

export const ScheduleLesson = ({ 
  lesson, 
  onAddTaskClick,
  onTaskClick,
  onDayClick,
  isDayExpanded // Добавляем проп для проверки состояния карточки
}) => {
  const handleAddTaskClick = (e) => {
    e.stopPropagation();
    // Вызываем клик по карточке только если она не выбрана
    if (onDayClick && !isDayExpanded) {
      onDayClick();
    }
    // Открываем диалог добавления задачи
    onAddTaskClick(lesson);
  };

  const handleTaskClick = (e) => {
    e.stopPropagation();
    // Вызываем клик по карточке только если она не выбрана
    if (onDayClick && !isDayExpanded) {
      onDayClick();
    }
    // Открываем попап задачи
    onTaskClick(lesson, lesson.task);
  };

  const handleCardClick = () => {
    if (onDayClick) {
      onDayClick();
    }
  };

  return (
    <div 
      className="border border-gray-200 dark:border-gray-700 rounded p-1.5 hover:bg-accent/5 transition-colors group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Первая строка: название предмета и тип занятия */}
      <div className="flex justify-between items-start gap-1 mb-1">
        <h3 className="font-medium text-xs leading-tight flex-1 line-clamp-2">
          {lesson.name}
        </h3>
        <span className={`text-[10px] px-1 py-0.5 rounded flex-shrink-0 ${LESSON_TYPES[lesson.type].color}`}>
          {LESSON_TYPES[lesson.type].label}
        </span>
      </div>
      
      {/* Вторая строка: задача ИЛИ информация с плюсом */}
      {lesson.task ? (
        // Если есть задача - показываем её
        <div className="mb-1">
          <TaskBadge 
            task={lesson.task} 
            onClick={handleTaskClick}
          />
        </div>
      ) : (
        // Если нет задачи - показываем информацию и плюс в одной строке
        <div className="flex items-center justify-between">
          {/* Справочная информация - теперь в одну строку без переносов */}
          <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground flex-1 min-w-0">
            <div className="flex items-center space-x-0.5 whitespace-nowrap">
              <Clock className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{lesson.time}</span>
            </div>
            <div className="flex items-center space-x-0.5 whitespace-nowrap">
              <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{lesson.room}</span>
            </div>
            <div className="flex items-center space-x-0.5 whitespace-nowrap min-w-0 flex-1">
              <User className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{lesson.teacher}</span>
            </div>
          </div>
          
          {/* Кнопка добавления - всегда видима */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-1 flex-shrink-0"
            onClick={handleAddTaskClick}
          >
            <Plus className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}

      {/* Третья строка: информация под задачей (только если есть задача) */}
      {lesson.task && (
        <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground min-w-0">
          <div className="flex items-center space-x-0.5 whitespace-nowrap">
            <Clock className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="truncate">{lesson.time}</span>
          </div>
          <div className="flex items-center space-x-0.5 whitespace-nowrap">
            <MapPin className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="truncate">{lesson.room}</span>
          </div>
          <div className="flex items-center space-x-0.5 whitespace-nowrap min-w-0 flex-1">
            <User className="h-2.5 w-2.5 flex-shrink-0" />
            <span className="truncate">{lesson.teacher}</span>
          </div>
        </div>
      )}
    </div>
  );
};