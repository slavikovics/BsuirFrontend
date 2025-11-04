// components/schedule.jsx
import { useState } from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User, CheckCircle2, Circle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { useSchedule } from "./use-schedule"

export function Schedule() {
  const {
    schedule,
    loading,
    error,
    expandedDayIndex,
    isAddTaskDialogOpen,
    selectedLesson,
    scrollContainerRef,
    LESSON_TYPES,
    handleDayClick,
    handleAddTaskClick,
    handleAddTask,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    nextDay,
    prevDay,
    setIsAddTaskDialogOpen,
  } = useSchedule()

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: ""
  })

  // Ранний возврат
  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-12 text-center">
        <div className="text-lg">Загрузка расписания...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-12 text-center">
        <div className="text-red-500">Ошибка: {error}</div>
      </div>
    )
  }

  const handleSubmitTask = () => {
    if (!newTask.title.trim()) return

    handleAddTask({
      ...newTask,
      completed: false,
      createdAt: new Date().toISOString()
    })

    setNewTask({ title: "", description: "", priority: "medium", deadline: "" })
    setIsAddTaskDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 pt-12 pb-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Расписание занятий</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevDay} 
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextDay} 
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Карусель дней с поддержкой перетягивания */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto py-5 space-x-4 scrollbar-hide min-h-[calc(100%+20px)] select-none px-4 -mx-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      >
        {schedule.map((day, index) => (
          <div
            key={day.id}
            className={`flex-none cursor-pointer transition-all duration-300 rounded-lg ${
              expandedDayIndex === index 
                ? 'w-80 scale-105 shadow-lg ring-2 ring-primary/30 ring-offset-2 dark:ring-primary/20' // Расширенная карточка
                : 'w-64 scale-100 opacity-90 shadow-sm hover:scale-[1.02] hover:shadow-md' // Обычная карточка
            }`}
            onClick={() => handleDayClick(index)}
          >
            <Card className="h-full border border-gray-200 dark:border-gray-800 shadow-none">
              <CardHeader className="pb-1 px-3 pt-3">
                <CardTitle className="flex justify-between items-center text-sm">
                  <span>{day.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {day.date}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-2 space-y-1.5">
                {day.lessons.length === 0 ? (
                  <p className="text-muted-foreground text-center py-2 text-xs">
                    Нет занятий
                  </p>
                ) : (
                  day.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border border-gray-200 dark:border-gray-700 rounded p-1.5 hover:bg-accent/5 transition-colors group"
                    >
                      <div className="flex justify-between items-start gap-1 mb-1">
                        <h3 className="font-medium text-xs leading-tight flex-1 line-clamp-2">
                          {lesson.name}
                        </h3>
                        <span className={`text-[10px] px-1 py-0.5 rounded flex-shrink-0 ${LESSON_TYPES[lesson.type].color}`}>
                          {LESSON_TYPES[lesson.type].label}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground flex-1 min-w-0">
                          <div className="flex items-center space-x-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            <span className="truncate">{lesson.time}</span>
                          </div>
                          <div className="flex items-center space-x-0.5">
                            <MapPin className="h-2.5 w-2.5" />
                            <span className="truncate">{lesson.room}</span>
                          </div>
                          <div className="flex items-center space-x-0.5 min-w-0 flex-1">
                            <User className="h-2.5 w-2.5 flex-shrink-0" />
                            <span className="truncate">{lesson.teacher}</span>
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddTaskClick(lesson)
                          }}
                        >
                          <Plus className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Подсказка */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Кликните на день, чтобы расширить его • Перетягивайте для прокрутки • Используйте стрелки для навигации
        </p>
      </div>

      {/* Диалог добавления задачи */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
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
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                className="h-8 text-sm"
              />
            </div>
            
            <div className="grid gap-1">
              <Label htmlFor="description" className="text-xs">Описание</Label>
              <Textarea
                id="description"
                rows={2}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Опишите детали задачи..."
                className="text-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-1">
                <Label htmlFor="priority" className="text-xs">Приоритет</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
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
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-1">
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)} size="sm" className="h-8">
              Отмена
            </Button>
            <Button onClick={handleAddTask} size="sm" className="h-8">
              Добавить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}