// components/schedule/schedule-card.jsx
import { Card, CardContent, CardHeader, CardTitle } from "../card"
import { ScheduleLesson } from "./schedule-lesson"

export const ScheduleCard = ({ 
  day, 
  index, 
  isExpanded, 
  onDayClick, 
  onAddTaskClick,
  onTaskClick 
}) => {
  return (
    <div
      className={`flex-none cursor-pointer transition-all duration-300 rounded-lg ${
        isExpanded 
          ? 'w-80 scale-105'
          : 'w-64 scale-100 opacity-90 shadow-sm hover:scale-[1.02] hover:shadow-md'
      }`}
      onClick={() => onDayClick(index)}
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
              <ScheduleLesson
                key={lesson.id}
                lesson={lesson}
                onAddTaskClick={onAddTaskClick}
                onTaskClick={onTaskClick}
                onDayClick={() => onDayClick(index)}
                isDayExpanded={isExpanded} // Передаем состояние карточки
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}