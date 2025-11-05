// components/schedule/index.jsx
import { Button } from "../button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ScheduleCarousel } from "./schedule-carousel"
import { AddTaskDialog } from "./add-task-dialog"
import { TaskPopup } from "./task-popup"
import { useSchedule } from "./use-schedule"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select" // ← ДОБАВЬ

export const Schedule = () => {
  const {
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
    subgroupFilter,
    setSubgroupFilter
  } = useSchedule()

  if (loading) {
    return <div className="container mx-auto px-4 pt-12 text-center text-lg">Загрузка расписания...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 pt-12 text-center text-red-500">Ошибка: {error}</div>
  }

return (
    <div className="container mx-auto px-4 pt-12 pb-6">
      {/* ХЕДЕР: Заголовок + ComboBox + Стрелки */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold">Расписание занятий</h2>

        <div className="flex items-center gap-3">
          {/* ComboBox — ЛЕВЕЕ стрелок */}
          <Select value={subgroupFilter} onValueChange={setSubgroupFilter}>
            <SelectTrigger className="w-48 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Вся группа</SelectItem>
              <SelectItem value="1">1-я подгруппа</SelectItem>
              <SelectItem value="2">2-я подгруппа</SelectItem>
            </SelectContent>
          </Select>

          {/* Стрелки */}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={prevDay} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextDay} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <ScheduleCarousel
        schedule={schedule}
        expandedDayIndex={expandedDayIndex}
        scrollContainerRef={scrollContainerRef}
        onDayClick={handleDayClick}
        onAddTaskClick={handleAddTaskClick}
        onTaskClick={handleTaskClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />

      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Кликните на день, чтобы расширить его • Перетягивайте для прокрутки • Используйте стрелки для навигации
        </p>
      </div>

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        selectedLesson={selectedLesson}
        onAddTask={handleAddTask}
      />

      {selectedTask && selectedLesson && (
        <TaskPopup
          isOpen={isTaskPopupOpen}
          onOpenChange={setIsTaskPopupOpen}
          task={selectedTask}
          lesson={selectedLesson}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onToggleComplete={handleToggleTaskComplete}
        />
      )}
    </div>
  )
}