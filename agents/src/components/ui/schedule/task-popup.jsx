// components/schedule/task-popup.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import { Button } from "../button";
import { Input } from "../input";
import { Textarea } from "../textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select";
import { Edit, Trash2, CheckCircle, Circle, Save, X } from "lucide-react";

export const TaskPopup = ({
  isOpen,
  onOpenChange,
  task,
  lesson,
  onEdit,
  onDelete,
  onToggleComplete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    if (isOpen && task) {
      setEditedTask(task);
      setIsEditing(false);
    }
  }, [isOpen, task]);

  if (!task || !lesson) {
    return null;
  }

  const handleSave = () => {
    onEdit(lesson, editedTask);
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(lesson, task);
    onOpenChange(false);
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high": return "Высокий приоритет";
      case "medium": return "Средний приоритет";
      case "low": return "Низкий приоритет";
      default: return "Приоритет не указан";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base">
            {isEditing ? 'Редактирование задачи' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Режим редактирования */}
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid gap-2">
                <Input
                  value={editedTask.title}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                  className="h-8 text-sm font-medium"
                  placeholder="Название задачи"
                />
              </div>

              <div className="grid gap-2">
                <Textarea
                  rows={3}
                  value={editedTask.description}
                  onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                  className="text-sm"
                  placeholder="Описание задачи..."
                />
              </div>

              <div className="grid gap-2">
                <Select
                  value={editedTask.priority}
                  onValueChange={(value) => setEditedTask(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Выберите приоритет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low" className="text-xs">Низкий</SelectItem>
                    <SelectItem value="medium" className="text-xs">Средний</SelectItem>
                    <SelectItem value="high" className="text-xs">Высокий</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm" className="h-8 flex-1">
                  <Save className="h-3 w-3 mr-1" />
                  Сохранить
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm" className="h-8">
                  <X className="h-3 w-3 mr-1" />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            /* Режим просмотра */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-2">
                    <span className="text-xs text-gray-500 capitalize">
                      {getPriorityText(task.priority)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Кнопка отметки выполнения */}
              <Button
                variant={task.completed ? "default" : "outline"}
                onClick={() => onToggleComplete(lesson, task)}
                className="w-full"
                size="sm"
              >
                {task.completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Выполнено
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Отметить как выполненное
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};