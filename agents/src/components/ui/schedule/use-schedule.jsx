// components/schedule/use-schedule.js
import { useState, useRef, useEffect, useCallback } from "react"
import { generateScheduleData } from "./schedule-data"

export const useSchedule = () => {
  const [schedule, setSchedule] = useState(generateScheduleData())
  const [expandedDayIndex, setExpandedDayIndex] = useState(null)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const scrollContainerRef = useRef(null)
  const scheduleRef = useRef(schedule) // Ref для хранения актуального расписания

  // Синхронизируем ref с state
  useEffect(() => {
    scheduleRef.current = schedule
  }, [schedule])

  const scrollToDay = (index, isExpanded = false) => {
    if (!scrollContainerRef.current) return
    
    const container = scrollContainerRef.current
    const cardWidth = isExpanded ? 320 : 256
    const gap = 16
    const containerWidth = container.clientWidth
    
    const scrollPosition = index * (256 + gap) - (containerWidth / 2) + (cardWidth / 2)
    const maxScroll = container.scrollWidth - containerWidth
    const constrainedPosition = Math.max(0, Math.min(scrollPosition, maxScroll))
    
    container.scrollTo({
      left: constrainedPosition,
      behavior: 'smooth'
    })
  }

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
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }

  const nextDay = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const dayWidth = 272
    const scrollAmount = dayWidth * 3
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const prevDay = () => {
    if (!scrollContainerRef.current) return
    const container = scrollContainerRef.current
    const dayWidth = 272
    const scrollAmount = dayWidth * 3
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' })
  }

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
    setIsAddTaskDialogOpen(true)
  }

  const handleTaskClick = (lesson, task) => {
    setSelectedLesson(lesson)
    setSelectedTask(task)
    setIsTaskPopupOpen(true)
  }

  // Используем useCallback для стабильных функций
  const handleAddTask = useCallback((taskData) => {
    if (!selectedLesson) return

    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(day => ({
        ...day,
        lessons: day.lessons.map(lesson => 
          lesson.id === selectedLesson.id 
            ? { ...lesson, task: taskData }
            : lesson
        )
      }))
      return updatedSchedule
    })

    setIsAddTaskDialogOpen(false)
    setSelectedLesson(null)
  }, [selectedLesson])

  const handleEditTask = useCallback((lesson, updatedTask) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(day => ({
        ...day,
        lessons: day.lessons.map(l => 
          l.id === lesson.id 
            ? { ...l, task: updatedTask }
            : l
        )
      }))
      return updatedSchedule
    })
  }, [])

  const handleDeleteTask = useCallback((lesson, task) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(day => ({
        ...day,
        lessons: day.lessons.map(l => 
          l.id === lesson.id 
            ? { ...l, task: null }
            : l
        )
      }))
      return updatedSchedule
    })

    setIsTaskPopupOpen(false)
    setSelectedLesson(null)
    setSelectedTask(null)
  }, [])

  const handleToggleTaskComplete = useCallback((lesson, task) => {
    setSchedule(prevSchedule => {
      const updatedSchedule = prevSchedule.map(day => ({
        ...day,
        lessons: day.lessons.map(l => 
          l.id === lesson.id && l.task 
            ? { ...l, task: { ...l.task, completed: !l.task.completed } }
            : l
        )
      }))
      return updatedSchedule
    })

    // Обновляем выбранную задачу если она открыта в попапе
    if (selectedTask && selectedLesson?.id === lesson.id) {
      setSelectedTask(prev => ({ ...prev, completed: !prev.completed }))
    }
  }, [selectedLesson, selectedTask])

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
  }, []) // Убрана зависимость от schedule

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  return {
    schedule,
    expandedDayIndex,
    isAddTaskDialogOpen,
    isTaskPopupOpen,
    selectedLesson,
    selectedTask,
    isDragging,
    scrollContainerRef,
    setIsAddTaskDialogOpen,
    setIsTaskPopupOpen,
    setSelectedLesson,
    setSelectedTask,
    handleDayClick,
    handleAddTaskClick,
    handleTaskClick,
    handleAddTask,
    handleEditTask,
    handleDeleteTask,
    handleToggleTaskComplete,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
    nextDay,
    prevDay
  }
}