// components/schedule/use-schedule.js
import { useState, useRef, useEffect } from "react"
import { generateScheduleData } from "./schedule-data"

export const useSchedule = () => {
  const [schedule] = useState(generateScheduleData())
  const [expandedDayIndex, setExpandedDayIndex] = useState(null)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  
  // Состояния для перетягивания
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const scrollContainerRef = useRef(null)

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

  // Навигация стрелками
  const nextDay = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const dayWidth = 272 // w-64 (256px) + gap (16px)
    const scrollAmount = dayWidth * 3
    
    container.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })
  }

  const prevDay = () => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const dayWidth = 272
    const scrollAmount = dayWidth * 3
    
    container.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    })
  }

  // Обработчик клика по карточке дня
  const handleDayClick = (index) => {
    if (expandedDayIndex === index) {
      setExpandedDayIndex(null)
    } else {
      setExpandedDayIndex(index)
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
      setTimeout(() => {
        scrollToDay(todayIndex, false)
      }, 300)
    }
  }, [schedule])

  // Устанавливаем курсор grab при загрузке
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  return {
    schedule,
    expandedDayIndex,
    isAddTaskDialogOpen,
    selectedLesson,
    newTask,
    isDragging,
    scrollContainerRef,
    setNewTask,
    setIsAddTaskDialogOpen,
    handleDayClick,
    handleAddTaskClick,
    handleAddTask,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    nextDay,
    prevDay
  }
}
