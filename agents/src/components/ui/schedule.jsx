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
  PRACTICAL: { label: "Практика", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  LAB: { label: "Лаб.", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  SEMINAR: { label: "Семинар", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" }
}

// Генерация данных для 120 дней
const generateScheduleData = () => {
  const daysOfWeek = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"]
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

  const schedule = []
  
  for (let i = 0; i < 120; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    const dayIndex = (date.getDay() + 6) % 7 // Преобразуем к 0=Пн, 6=Вс
    const dayName = daysOfWeek[dayIndex]
    const formattedDate = date.toLocaleDateString('ru-RU')
    
    // Генерируем занятия только для будних дней (Пн-Пт)
    const lessons = dayIndex < 5 
      ? Array.from({ length: 2 + Math.floor(Math.random() * 4) }, (_, lessonIndex) => {
          const subject = subjects[Math.floor(Math.random() * subjects.length)]
          const typeKeys = Object.keys(LESSON_TYPES)
          const type = typeKeys[Math.floor(Math.random() * typeKeys.length)]
          
          return {
            id: `${i}-${lessonIndex}`,
            name: subject.name,
            type: type,
            teacher: subject.teachers[Math.floor(Math.random() * subject.teachers.length)],
            room: rooms[Math.floor(Math.random() * rooms.length)],
            time: `${8 + lessonIndex * 2}:00-${9 + lessonIndex * 2}:50`
          }
        })
      : []

    schedule.push({
      id: i + 1,
      name: dayName,
      date: formattedDate,
      fullDate: date,
      lessons
    })
  }
  
  return schedule
}

export function Schedule() {
  const [schedule] = useState(generateScheduleData())
  const [expandedDayIndex, setExpandedDayIndex] = useState(null)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const scrollContainerRef = useRef(null)
  
  // Состояния для перетягивания
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Данные для новой задачи
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    deadline: ""
  })

  // Функция для центрирования карточки
  const scrollToDay = (index, isExpanded = false) => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const cardWidth = isExpanded ? 320 : 256 // w-80 или w-64
    const gap = 16 // space-x-4
    const containerWidth = container.clientWidth
    
    // Позиция для центрирования карточки
    const scrollPosition = index * (256 + gap) - (containerWidth / 2) + (cardWidth / 2)
    
    // Ограничиваем прокрутку, чтобы крайние карточки не обрезались
    const maxScroll = container.scrollWidth - containerWidth
    const constrainedPosition = Math.max(0, Math.min(scrollPosition, maxScroll))
    
    container.scrollTo({
      left: constrainedPosition,
      behavior: 'smooth'
    })
  }

  // Обработчики для перетягивания
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.userSelect = 'none'
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false)
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.removeProperty('user-select')
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2 // Умножаем для более быстрой прокрутки
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  // Простая навигация стрелками - просто прокрутка
  const nextDay = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const dayWidth = 272 // w-64 (256px) + gap (16px)
    const scrollAmount = dayWidth * 3 // Прокручиваем на 3 дня вперед
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }

  const prevDay = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const dayWidth = 272 // w-64 (256px) + gap (16px)
    const scrollAmount = dayWidth * 3 // Прокручиваем на 3 дня назад
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    })
  }

  // Обработчик клика по карточке дня - расширяем/сворачиваем и центрируем
  const handleDayClick = (index) => {
    if (expandedDayIndex === index) {
      // Если кликаем на уже расширенную карточку - сворачиваем
      setExpandedDayIndex(null)
    } else {
      // Расширяем новую карточку и центрируем её
      setExpandedDayIndex(index)
      // Небольшая задержка для применения стилей перед центрированием
      setTimeout(() => {
        scrollToDay(index, true)
      }, 10)
    }
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
    setIsAddTaskDialogOpen(false)
    setSelectedLesson(null)
  }

  // Прокрутка к сегодняшнему дню при загрузке
  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayIndex = schedule.findIndex(day => {
      const dayDate = new Date(day.fullDate)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate.getTime() === today.getTime()
    })
    
    if (todayIndex !== -1) {
      // Прокручиваем к сегодняшнему дню, но не расширяем его
      setTimeout(() => {
        scrollToDay(todayIndex, false)
      }, 300)
    }
  }, [])

  // Устанавливаем курсор grab при загрузке
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

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