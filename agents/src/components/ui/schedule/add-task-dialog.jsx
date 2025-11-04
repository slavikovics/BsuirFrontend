// components/schedule/add-task-dialog.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "../dialog";
import { Input } from "../input";
import { Label } from "../label";
import { Textarea } from "../textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../select";
import { Button } from "../button";

export const AddTaskDialog = ({
  isOpen,
  onOpenChange,
  selectedLesson,
  onAddTask
}) => {
  const [localTask, setLocalTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: ""
  });

  useEffect(() => {
    if (isOpen && selectedLesson) {
      setLocalTask({
        title: `Задание по ${selectedLesson.name || ''}`,
        description: "",
        priority: "medium",
        deadline: ""
      });
    }
  }, [isOpen, selectedLesson]);

  const updateField = useCallback((field, value) => {
    setLocalTask(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleTitleChange = useCallback(
    (e) => updateField("title", e.target.value),
    [updateField]
  );

  const handleDescriptionChange = useCallback(
    (e) => updateField("description", e.target.value),
    [updateField]
  );

  const handlePriorityChange = useCallback(
    (value) => updateField("priority", value),
    [updateField]
  );

  const handleDeadlineChange = useCallback(
    (e) => updateField("deadline", e.target.value),
    [updateField]
  );

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSave = useCallback(() => {
    if (localTask.title.trim() && onAddTask) {
      onAddTask({
        ...localTask,
        id: Date.now().toString(),
        completed: false
      });
    }
    onOpenChange(false);
  }, [localTask, onAddTask, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-base">Добавить задачу</DialogTitle>
          <DialogDescription className="text-xs">
            Для предмета: {selectedLesson?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-1">
          <div className="grid gap-1">
            <Label htmlFor="title" className="text-xs">Название задачи</Label>
            <Input
              id="title"
              value={localTask.title}
              onChange={handleTitleChange}
              className="h-8 text-sm"
            />
          </div>

          <div className="grid gap-1">
            <Label htmlFor="description" className="text-xs">Описание</Label>
            <Textarea
              id="description"
              rows={2}
              value={localTask.description}
              onChange={handleDescriptionChange}
              placeholder="Опишите детали задачи..."
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="priority" className="text-xs">Приоритет</Label>
              <Select 
                value={localTask.priority} 
                onValueChange={handlePriorityChange}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">Низкий</SelectItem>
                  <SelectItem value="medium" className="text-xs">Средний</SelectItem>
                  <SelectItem value="high" className="text-xs">Высокий</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1">
              <Label htmlFor="deadline" className="text-xs">Срок выполнения</Label>
              <Input
                id="deadline"
                type="date"
                value={localTask.deadline}
                onChange={handleDeadlineChange}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-1">
          <Button variant="outline" onClick={handleCancel} size="sm" className="h-8">
            Отмена
          </Button>
          <Button onClick={handleSave} size="sm" className="h-8">
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};