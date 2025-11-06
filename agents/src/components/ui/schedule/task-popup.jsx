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

  if (!task || !lesson) return null;

  const handleSave = () => {
    onEdit(lesson, editedTask);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTask(task);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(lesson);
  };

  const handleToggleComplete = () => {
    onToggleComplete(lesson.id);
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case "high": return "Высокий";
      case "medium": return "Средний";
      case "low": return "Низкий";
      default: return "Не указан";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base">
            {isEditing ? 'Редактирование задачи' : task.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask(prev => ({ ...prev, title: e.target.value }))}
                className="h-8 text-sm font-medium"
                placeholder="Название задачи"
              />
              <Textarea
                rows={3}
                value={editedTask.description || ""}
                onChange={(e) => setEditedTask(prev => ({ ...prev, description: e.target.value }))}
                className="text-sm"
                placeholder="Описание задачи..."
              />
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
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} size="sm" className="h-8 flex-1">
                  <Save className="h-3 w-3 mr-1" />
                  Сохранить
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm" className="h-8 flex-1">
                  <X className="h-3 w-3 mr-1" />
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap mb-2">
                      {task.description}
                    </p>
                  )}
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>Приоритет: {getPriorityText(task.priority)}</div>
                    <div>Создано: {formatDate(task.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-md">
                <h4 className="text-sm font-medium mb-1">Связанное занятие:</h4>
                <p className="text-sm">{lesson.name}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.time} • {lesson.date}
                </p>
              </div>

              <Button
                variant={task.completed ? "default" : "outline"}
                onClick={handleToggleComplete}
                className="w-full"
              >
                {task.completed ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Выполнено
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 mr-2" />
                    Отметить выполненным
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