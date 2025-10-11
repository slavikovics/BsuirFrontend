// components/schedule/index.jsx
import { Button } from "../button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ScheduleCarousel } from "./schedule-carousel"
import { AddTaskDialog } from "./add-task-dialog"
import { useSchedule } from "./use-schedule"

export const Schedule = () => {
  const {
    schedule,
    expandedDayIndex,
    isAddTaskDialogOpen,
    selectedLesson,
    newTask,
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
  } = useSchedule()

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

      <ScheduleCarousel
        schedule={schedule}
        expandedDayIndex={expandedDayIndex}
        scrollContainerRef={scrollContainerRef}
        onDayClick={handleDayClick}
        onAddTaskClick={handleAddTaskClick}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />

      {/* Подсказка */}
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Кликните на день, чтобы расширить его • Перетягивайте для прокрутки • Используйте стрелки для навигации
        </p>
      </div>

      <AddTaskDialog
        isOpen={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        selectedLesson={selectedLesson}
        newTask={newTask}
        onTaskChange={setNewTask}
        onAddTask={handleAddTask}
      />
    </div>
  )
}