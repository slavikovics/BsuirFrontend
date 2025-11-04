// components/schedule/use-schedule.js
import { useState, useRef, useEffect, useCallback } from "react"
import { fetchScheduleData } from './schedule-data'

export const LESSON_TYPES = {
  LECTURE: { label: "Лекция", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  PRACTICAL: { label: "Практика", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  LAB: { label: "Лаб.", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  CONSULTATION: { label: "Консультация", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  EXAM: { label: "Экзамен", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export const useSchedule = () => {
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [expandedDayIndex, setExpandedDayIndex] = useState(null)
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isTaskPopupOpen, setIsTaskPopupOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const scrollContainerRef = useRef(null)

  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      try {
        const data = await fetchScheduleData()
        setSchedule(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadSchedule()
  }, [])

  useEffect(() => {
    if (loading || schedule.length === 0) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayIndex = schedule.findIndex(day => {
      const dayDate = new Date(day.fullDate)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate.getTime() === today.getTime()
    })

    if (todayIndex !== -1) {
      setTimeout(() => scrollToDay(todayIndex, false), 300)
    }
  }, [schedule, loading])

  const scrollToDay = useCallback((index, isExpanded = false) => {
    if (!scrollContainerRef.current) return

    const container = scrollContainerRef.current
    const cardWidth = isExpanded ? 320 : 256
    const gap = 16
    const containerWidth = container.clientWidth

    const scrollPosition = index * (256 + gap) - (containerWidth / 2) + (cardWidth / 2)
    const maxScroll = container.scrollWidth - containerWidth
    const position = Math.max(0, Math.min(scrollPosition, maxScroll))

    container.scrollTo({ left: position, behavior: 'smooth' })
  }, [])

  const handleMouseDown = useCallback((e) => {
    setIsDragging(true)
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft)
    setScrollLeft(scrollContainerRef.current.scrollLeft)
    scrollContainerRef.current.style.cursor = 'grabbing'
    scrollContainerRef.current.style.userSelect = 'none'
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false)
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    scrollContainerRef.current.style.cursor = 'grab'
    scrollContainerRef.current.style.removeProperty('user-select')
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - scrollContainerRef.current.offsetLeft
    const walk = (x - startX) * 2
    scrollContainerRef.current.scrollLeft = scrollLeft - walk
  }, [isDragging, startX, scrollLeft])

  const nextDay = useCallback(() => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: 272 * 3, behavior: 'smooth' })
  }, [])

  const prevDay = useCallback(() => {
    if (!scrollContainerRef.current) return
    scrollContainerRef.current.scrollBy({ left: -272 * 3, behavior: 'smooth' })
  }, [])

  const handleDayClick = useCallback((index) => {
    const newExpanded = expandedDayIndex === index ? null : index
    setExpandedDayIndex(newExpanded)
    setTimeout(() => scrollToDay(index, newExpanded !== null), 10)
  }, [expandedDayIndex, scrollToDay])

  const handleAddTaskClick = useCallback((lesson) => {
    setSelectedLesson(lesson)
    setIsAddTaskDialogOpen(true)
  }, [])

  const handleTaskClick = useCallback((lesson, task) => {
    setSelectedLesson(lesson)
    setSelectedTask(task)
    setIsTaskPopupOpen(true)
  }, [])

  const handleAddTask = useCallback((taskData) => {
    if (!selectedLesson) return

    const dayIndex = schedule.findIndex(d => d.lessons.some(l => l.id === selectedLesson.id))

    setSchedule(prev => prev.map(day => ({
      ...day,
      lessons: day.lessons.map(l =>
        l.id === selectedLesson.id ? { ...l, task: taskData } : l
      )
    })))

    setIsAddTaskDialogOpen(false)
    setSelectedLesson(null)

    if (dayIndex !== -1) {
      setTimeout(() => scrollToDay(dayIndex, true), 100)
    }
  }, [selectedLesson, schedule, scrollToDay])

  const handleEditTask = useCallback((lesson, updatedTask) => {
    setSchedule(prev => prev.map(day => ({
      ...day,
      lessons: day.lessons.map(l =>
        l.id === lesson.id ? { ...l, task: updatedTask } : l
      )
    })))
  }, [])

  const handleDeleteTask = useCallback((lesson, task) => {
    setSchedule(prev => prev.map(day => ({
      ...day,
      lessons: day.lessons.map(l =>
        l.id === lesson.id ? { ...l, task: null } : l
      )
    })))
    setIsTaskPopupOpen(false)
    setSelectedLesson(null)
    setSelectedTask(null)
  }, [])

  const handleToggleTaskComplete = useCallback((lessonId) => {
    setSchedule(prev => prev.map(day => ({
      ...day,
      lessons: day.lessons.map(l =>
        l.id === lessonId && l.task
          ? { ...l, task: { ...l.task, completed: !l.task.completed } }
          : l
      )
    })))

    if (selectedTask && selectedLesson?.id === lessonId) {
      setSelectedTask(prev => ({ ...prev, completed: !prev.completed }))
    }
  }, [selectedLesson, selectedTask])

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  return {
    schedule,
    loading,
    error,
    expandedDayIndex,
    isAddTaskDialogOpen,
    isTaskPopupOpen,
    selectedLesson,
    selectedTask,
    scrollContainerRef,
    setIsAddTaskDialogOpen,
    setIsTaskPopupOpen,
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
    prevDay,
    LESSON_TYPES
  }
}