// components/schedule/add-task-dialog.jsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../dialog"
import { Input } from "../input"
import { Label } from "../label"
import { Textarea } from "../textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { Button } from "../button"

export const AddTaskDialog = ({
  isOpen,
  onOpenChange,
  selectedLesson,
  newTask,
  onTaskChange,
  onAddTask
}) => {
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
              value={newTask.title}
              onChange={(e) => onTaskChange({...newTask, title: e.target.value})}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="grid gap-1">
            <Label htmlFor="description" className="text-xs">Описание</Label>
            <Textarea
              id="description"
              rows={2}
              value={newTask.description}
              onChange={(e) => onTaskChange({...newTask, description: e.target.value})}
              placeholder="Опишите детали задачи..."
              className="text-sm"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-1">
              <Label htmlFor="priority" className="text-xs">Приоритет</Label>
              <Select 
                value={newTask.priority} 
                onValueChange={(value) => onTaskChange({...newTask, priority: value})}
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
                value={newTask.deadline}
                onChange={(e) => onTaskChange({...newTask, deadline: e.target.value})}
                className="h-8 text-xs"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter className="gap-1">
          <Button variant="outline" onClick={() => onOpenChange(false)} size="sm" className="h-8">
            Отмена
          </Button>
          <Button onClick={onAddTask} size="sm" className="h-8">
            Добавить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}