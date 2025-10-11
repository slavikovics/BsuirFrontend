// components/schedule.jsx
import { useState, useRef, useEffect } from "react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Plus, ChevronLeft, ChevronRight, Clock, MapPin, User } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
import { Input } from "./input"
import { Label } from "./label"
import { Textarea } from "./textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

// Типы занятий
const LESSON_TYPES = {
  LECTURE: { label: "Лекция", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  PRACTICAL: { label: "Практическое", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  LAB: { label: "Лабораторная", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  SEMINAR: { label: "Семинар", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
}

// Фиктивные данные расписания
const generateScheduleData = () => {
  const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"]
  const subjects = [
    { name: "Математический анализ", teachers: ["Проф. Иванов", "Доц. Петрова"] },
    { name: "Программирование", teachers: ["Проф. Сидоров", "Ст. преп. Козлов"] },
    { name: "Физика", teachers: ["Проф. Николаев", "Доц. Волкова"] },
    { name: "Алгоритмы и структуры данных", teachers: ["Проф. Смирнов"] },
    { name: "Базы данных", teachers: ["Доц. Федорова", "Асс. Ковалев"] },
    { name: "Веб-разработка", teachers: ["Проф. Михайлов"] },
    { name: "Иностранный язык", teachers: ["Доц. Яковлева", "Преп. Морозова"] }
  ]
  const rooms = ["101", "202", "303", "404", "505", "Актовый зал", "Комп. класс 1", "Комп. класс 2"]

  return days.map((day, dayIndex) => ({
    id: dayIndex + 1,
    name: day,
    date: new Date(Date.now() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
    lessons: Array.from({ length: 3 + Math.floor(Math.random() * 3) }, (_, i) => {
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const typeKeys = Object.keys(LESSON_TYPES)
      const type = typeKeys[Math.floor(Math.random() * typeKeys.length)]
      
      return {
        id: `${dayIndex}-${i}`,
        name: subject.name,
        type: type,
        teacher: subject.teachers[Math.floor(Math.random() * subject.teachers.length)],
        room: rooms[Math.floor(Math.random() * rooms.length)],
        time: `${9 + i * 2}:00 - ${10 + i * 2}:50`
      }
    })
  }))
}

export function Schedule() {
  const [schedule] = useState(generateScheduleData())
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const scrollContainerRef = useRef(null)

  // Данные для новой задачи
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: ""
  })

  const nextDay = () => {
    setCurrentDayIndex((prev) => (prev + 1) % schedule.length)
  }

  const prevDay = () => {
    setCurrentDayIndex((prev) => (prev - 1 + schedule.length) % schedule.length)
  }

  const handleAddTaskClick = (lesson) => {
    setSelectedLesson(lesson)
    setNewTask({
      title: `Задание по ${lesson.name}`,
      description: "",
      priority: "medium",
      deadline: ""
    })
    setIsAddTaskDialogOpen(true)
  }

  const handleAddTask = () => {
    console.log("Добавлена задача:", {
      ...newTask,
      lesson: selectedLesson
    })
    // Здесь будет логика сохранения задачи
    setIsAddTaskDialogOpen(false)
    setSelectedLesson(null)
  }

  // Автопрокрутка к текущему дню
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const dayElement = container.children[currentDayIndex]
      if (dayElement) {
        dayElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        })
      }
    }
  }, [currentDayIndex])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">Расписание занятий</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={prevDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentDayIndex + 1} / {schedule.length}
          </span>
          <Button variant="outline" size="icon" onClick={nextDay}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Карусель дней */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto pb-6 space-x-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {schedule.map((day, index) => (
          <div
            key={day.id}
            className={`flex-none w-80 snap-center transition-all duration-300 ${
              index === currentDayIndex ? 'scale-105' : 'scale-95 opacity-80'
            }`}
          >
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex justify-between items-center">
                  <span>{day.name}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {day.date}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {day.lessons.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    Занятий нет
                  </p>
                ) : (
                  day.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm">{lesson.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${LESSON_TYPES[lesson.type].color}`}>
                          {LESSON_TYPES[lesson.type].label}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{lesson.time}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{lesson.room}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{lesson.teacher}</span>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleAddTaskClick(lesson)}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Добавить задачу
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* Индикаторы дней */}
      <div className="flex justify-center space-x-2 mt-4">
        {schedule.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentDayIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentDayIndex
                ? 'bg-primary w-4'
                : 'bg-muted-foreground/30'
            }`}
          />
        ))}
      </div>

      {/* Диалог добавления задачи */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Добавить задачу</DialogTitle>
            <DialogDescription>
              Создайте новую задачу для предмета {selectedLesson?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Название задачи</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                rows={3}
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Опишите детали задачи..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="priority">Приоритет</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask({...newTask, priority: value})}
                >
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
              
              <div className="grid gap-2">
                <Label htmlFor="deadline">Срок выполнения</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTaskDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddTask}>
              Добавить задачу
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}