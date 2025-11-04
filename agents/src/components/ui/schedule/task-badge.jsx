// components/schedule/task-badge.jsx
import React from "react";

export const TaskBadge = ({ task, onClick }) => {
  if (!task) {
    return null;
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "border-l-red-500 bg-red-50 dark:bg-red-900/20";
      case "medium": return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
      case "low": return "border-l-green-500 bg-green-50 dark:bg-green-900/20";
      default: return "border-l-gray-300 bg-gray-50 dark:bg-gray-800";
    }
  };

  return (
    <div
      className={`p-1.5 border border-l-4 rounded cursor-pointer hover:shadow-sm transition-all ${getPriorityColor(task.priority)} ${
        task.completed ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`text-xs font-medium truncate ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </h4>
            {task.completed && (
              <span className="text-[10px] text-green-600 bg-green-100 px-1 rounded flex-shrink-0">
                выполнено
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};