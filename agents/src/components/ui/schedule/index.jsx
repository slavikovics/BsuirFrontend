// components/schedule/index.jsx
import { Button } from "../button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ScheduleCarousel } from "./schedule-carousel"
import { AddTaskDialog } from "./add-task-dialog"
import { TaskPopup } from "./task-popup"
import { useSchedule } from "./use-schedule"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select"
import { useAuth } from "../auth-component"
import { ScheduleAnalysis } from "./schedule-analysis"
import { ConsultationComponent } from "./consultation-component"

export const Schedule = () => {
  const { user } = useAuth()
  const groupNumber = user?.groupNumber

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
    analysisData, // ← ДОБАВЛЯЕМ ДАННЫЕ АНАЛИЗА
    isAnalysisLoading, // ← ДОБАВЛЯЕМ СОСТОЯНИЕ ЗАГРУЗКИ
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
    setSubgroupFilter,
    runScheduleAnalysis // ← ДОБАВЛЯЕМ ФУНКЦИЮ ЗАПУСКА АНАЛИЗА
  } = useSchedule(groupNumber)

  // Если пользователь не указал группу - показываем обычный текст
  if (!groupNumber) {
    return (
      <div className="container mx-auto px-4 pt-12">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Расписание занятий</h2>
          <div className="max-w-md mx-auto space-y-3">
            <p className="text-muted-foreground">
              Для просмотра расписания необходимо указать номер вашей учебной группы.
            </p>
            <p className="text-sm text-muted-foreground">
              Перейдите в настройки профиля и укажите номер группы из 6 цифр.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 pt-12 text-center">
        <div className="text-lg text-foreground">Загрузка расписания для группы {groupNumber}...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pt-12 text-center">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Ошибка загрузки</h2>
          <p className="text-destructive">Ошибка: {error}</p>
          <p className="text-sm text-muted-foreground">
            Не удалось загрузить расписание для группы {groupNumber}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-12 pb-6">
      {/* ХЕДЕР: Заголовок + ComboBox + Стрелки */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Расписание занятий</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Группа: {groupNumber}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* ComboBox */}
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

          {/* Кнопка анализа расписания */}
          <Button 
            onClick={runScheduleAnalysis}
            disabled={isAnalysisLoading}
            variant="outline"
            className="h-9"
          >
            {isAnalysisLoading ? "Анализ..." : "Проанализировать расписание"}
          </Button>

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

      {/* КОМПОНЕНТ АНАЛИЗА РАСПИСАНИЯ */}
      <ScheduleAnalysis 
        data={analysisData}
        isLoading={isAnalysisLoading}
      />

      <ConsultationComponent/>

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