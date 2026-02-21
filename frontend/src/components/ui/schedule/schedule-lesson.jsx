// components/schedule/schedule-lesson.jsx
import React from "react";
import { Button } from "../button";
import { Plus, Clock, MapPin, User, Users, UserCheck } from "lucide-react";
import { LESSON_TYPES } from "./schedule-types";
import { TaskBadge } from "./task-badge";

const FALLBACK_TYPE = {
  label: "Занятие",
  color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
};

export const ScheduleLesson = ({ 
  lesson, 
  onAddTaskClick,
  onTaskClick,
  onDayClick,
  isDayExpanded
}) => {
  const typeStyle = LESSON_TYPES[lesson.type] || FALLBACK_TYPE;

  const handleAddTask = (e) => {
    e.stopPropagation();
    if (onDayClick && !isDayExpanded) onDayClick();
    onAddTaskClick(lesson);
  };

  const handleTask = (e) => {
    e.stopPropagation();
    if (onDayClick && !isDayExpanded) onDayClick();
    onTaskClick(lesson, lesson.task);
  };

  const handleClick = () => {
    if (onDayClick) onDayClick();
  };

  return (
    <div 
      className="border border-border rounded p-1.5 hover:bg-accent/5 transition-colors group cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start gap-1 mb-1">
        <h3 className="font-medium text-xs leading-tight flex-1 line-clamp-2">
          {lesson.name}
        </h3>
        <span className={`text-[10px] px-1 py-0.5 rounded flex items-center gap-1 flex-shrink-0 ${typeStyle.color}`}>
          {lesson.groupType === 'group' ? (
            <Users className="h-3 w-3" />
          ) : (
            <UserCheck className="h-3 w-3" />
          )}
          {lesson.groupType === 'subgroup' && (
            <span className="font-medium">{lesson.subgroup}</span>
          )}
          {typeStyle.label}
        </span>
      </div>

      {lesson.task ? (
        <div className="mb-1">
          <TaskBadge task={lesson.task} onClick={handleTask} />
        </div>
      ) : (
        <div className="flex items-center justify-between">
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

          {/* Кнопка +: всегда видна на мобильных, hover на десктопе */}
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 ml-1 flex-shrink-0 opacity-40 group-hover:opacity-100 md:opacity-100 transition-opacity"
            onClick={handleAddTask}
          >
            <Plus className="h-2.5 w-2.5" />
          </Button>
        </div>
      )}

      {lesson.task && (
        <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground mt-1 min-w-0">
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

      {lesson.note && (
        <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-1 truncate">
          {lesson.note}
        </p>
      )}
    </div>
  );
};