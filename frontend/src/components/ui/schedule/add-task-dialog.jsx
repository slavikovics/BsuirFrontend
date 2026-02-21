import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../dialog"
import { Button } from "../button"
import { Input } from "../input"
import { Textarea } from "../textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../select"
import { Plus } from "lucide-react"

export const AddTaskDialog = ({
  isOpen,
  onOpenChange,
  selectedLesson,
  onAddTask
}) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")

  useEffect(() => {
    if (isOpen) {
      setTitle("")
      setDescription("")
      setPriority("medium")
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert("Введите название задачи")
      return
    }

    onAddTask({
      title: title.trim(),
      description: description.trim() || null,
      priority
    })

    onOpenChange(false)
  }

  if (!selectedLesson) return null

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Добавить задачу</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Название задачи *
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Введите название задачи"
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Описание
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Добавьте описание задачи (необязательно)"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="priority" className="text-sm font-medium">
              Приоритет
            </label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Низкий</SelectItem>
                <SelectItem value="medium">Средний</SelectItem>
                <SelectItem value="high">Высокий</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Занятие:</h4>
            <p className="text-sm">{selectedLesson.name}</p>
            <p className="text-xs text-muted-foreground">
              {selectedLesson.time} • {selectedLesson.date}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Добавить задачу
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}