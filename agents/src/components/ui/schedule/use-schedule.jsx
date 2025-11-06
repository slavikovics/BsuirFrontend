// components/schedule/use-schedule.js
import { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from "react"
import { fetchScheduleData } from './schedule-data'

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081"

export const LESSON_TYPES = {
  LECTURE: { label: "Лекция", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" },
  PRACTICAL: { label: "Практика", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
  LAB: { label: "Лаб.", color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
  CONSULTATION: { label: "Консультация", color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
  EXAM: { label: "Экзамен", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
}

export const useSchedule = (groupNumber) => {
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
  const pendingScrollRef = useRef(null)
  const initialLoadRef = useRef(true)

  // === ФИЛЬТР ПО ПОДГРУППАМ ===
  const [subgroupFilter, setSubgroupFilter] = useState("all")

  // === ФИЛЬТРОВАННОЕ РАСПИСАНИЕ ===
  const filteredSchedule = useMemo(() => {
    if (subgroupFilter === "all") return schedule

    return schedule.map(day => ({
      ...day,
      lessons: day.lessons.filter(lesson => {
        if (lesson.subgroup === null) return true
        return lesson.subgroup === Number(subgroupFilter)
      })
    }))
  }, [schedule, subgroupFilter])

  // === Функция для загрузки задач для занятия ===
  const fetchTasksForLesson = async (lessonId) => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch(`${API_BASE_URL}/api/tasks/lesson/${lessonId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        return await response.json()
      }
      return []
    } catch (error) {
      console.error("Error fetching tasks for lesson:", error)
      return []
    }
  }

  // === Функция для загрузки всех задач ===
  const loadTasksForSchedule = async (scheduleData) => {
    if (!scheduleData.length) return scheduleData

    const scheduleWithTasks = await Promise.all(
      scheduleData.map(async (day) => {
        const lessonsWithTasks = await Promise.all(
          day.lessons.map(async (lesson) => {
            const tasks = await fetchTasksForLesson(lesson.id)
            return {
              ...lesson,
              task: tasks.length > 0 ? tasks[0] : null // Берем первую задачу (можно изменить логику если нужно несколько)
            }
          })
        )

        return {
          ...day,
          lessons: lessonsWithTasks
        }
      })
    )

    return scheduleWithTasks
  }

  // === Единый эффект для прокрутки ===
  useLayoutEffect(() => {
    if (pendingScrollRef.current !== null && scrollContainerRef.current) {
      const index = pendingScrollRef.current
      pendingScrollRef.current = null

      requestAnimationFrame(() => {
        scrollToDay(index, expandedDayIndex === index)
      })
    }
  }, [filteredSchedule, expandedDayIndex])

  // === Загрузка расписания при изменении группы ===
  useEffect(() => {
    const loadSchedule = async () => {
      setLoading(true)
      setError(null)
      try {
        if (!groupNumber) {
          setSchedule([])
          return
        }

        const data = await fetchScheduleData(groupNumber)
        const scheduleWithTasks = await loadTasksForSchedule(data)
        setSchedule(scheduleWithTasks)
      } catch (err) {
        setError(err.message)
        setSchedule([])
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [groupNumber])

  // === Прокрутка к сегодняшнему дню ===
  useEffect(() => {
    if (loading || filteredSchedule.length === 0 || !initialLoadRef.current) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayIndex = filteredSchedule.findIndex(day => {
      const dayDate = new Date(day.fullDate)
      dayDate.setHours(0, 0, 0, 0)
      return dayDate.getTime() === today.getTime()
    })

    if (todayIndex !== -1) {
      pendingScrollRef.current = todayIndex
    }
    
    initialLoadRef.current = false
  }, [filteredSchedule, loading])

  // === Остальные функции ===
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

  // === CRUD операции с задачами ===
const handleAddTask = useCallback(async (taskData) => {
  if (!selectedLesson) return

  try {
    const token = localStorage.getItem("jwt_token")
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        lessonId: selectedLesson.id,
        lessonName: selectedLesson.name,
        lessonTime: selectedLesson.time,
        lessonDate: selectedLesson.date
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to create task")
    }

    const newTask = await response.json()

    // Обновляем локальное состояние
    setSchedule(prev => prev.map(day => ({
      ...day,
      lessons: day.lessons.map(lesson =>
        lesson.id === selectedLesson.id
          ? { ...lesson, task: newTask }
          : lesson
      )
    })))

    setIsAddTaskDialogOpen(false)
    setSelectedLesson(null)
  } catch (error) {
    console.error("Error creating task:", error)
    alert("Ошибка при создании задачи")
  }
}, [selectedLesson])

  const handleEditTask = useCallback(async (lesson, updatedTask) => {
    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch(`${API_BASE_URL}/api/tasks/${updatedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const savedTask = await response.json()

      // Обновляем локальное состояние
      setSchedule(prev => prev.map(day => ({
        ...day,
        lessons: day.lessons.map(l =>
          l.id === lesson.id ? { ...l, task: savedTask } : l
        )
      })))

      // Обновляем выбранную задачу если она открыта
      if (selectedTask && selectedTask.id === updatedTask.id) {
        setSelectedTask(savedTask)
      }
    } catch (error) {
      console.error("Error updating task:", error)
      alert("Ошибка при обновлении задачи")
    }
  }, [selectedTask])

  const handleDeleteTask = useCallback(async (lesson) => {
    if (!lesson.task) return

    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch(`${API_BASE_URL}/api/tasks/${lesson.task.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      // Обновляем локальное состояние
      setSchedule(prev => prev.map(day => ({
        ...day,
        lessons: day.lessons.map(l =>
          l.id === lesson.id ? { ...l, task: null } : l
        )
      })))

      setIsTaskPopupOpen(false)
      setSelectedLesson(null)
      setSelectedTask(null)
    } catch (error) {
      console.error("Error deleting task:", error)
      alert("Ошибка при удалении задачи")
    }
  }, [])

  const handleToggleTaskComplete = useCallback(async (lessonId) => {
    const lesson = schedule
      .flatMap(day => day.lessons)
      .find(l => l.id === lessonId)

    if (!lesson || !lesson.task) return

    try {
      const token = localStorage.getItem("jwt_token")
      const response = await fetch(`${API_BASE_URL}/api/tasks/${lesson.task.id}/toggle-complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to toggle task completion")
      }

      const updatedTask = await response.json()

      // Обновляем локальное состояние
      setSchedule(prev => prev.map(day => ({
        ...day,
        lessons: day.lessons.map(l =>
          l.id === lessonId && l.task
            ? { ...l, task: updatedTask }
            : l
        )
      })))

      if (selectedTask && selectedLesson?.id === lessonId) {
        setSelectedTask(updatedTask)
      }
    } catch (error) {
      console.error("Error toggling task completion:", error)
      alert("Ошибка при изменении статуса задачи")
    }
  }, [schedule, selectedLesson, selectedTask])

  // === Курсор grab ===
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.style.cursor = 'grab'
    }
  }, [])

  return {
    schedule: filteredSchedule,
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
    LESSON_TYPES,
    subgroupFilter,
    setSubgroupFilter
  }
}