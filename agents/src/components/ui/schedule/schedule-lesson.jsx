// components/schedule/schedule-lesson.jsx
import { Button } from "../button"
import { Plus, Clock, MapPin, User } from "lucide-react"
import { LESSON_TYPES } from "./schedule-types"

export const ScheduleLesson = ({ lesson, onAddTaskClick }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded p-1.5 hover:bg-accent/5 transition-colors group">
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
          className="h-5 w-5 ml-1"
          onClick={(e) => {
            e.stopPropagation()
            onAddTaskClick(lesson)
          }}
        >
          <Plus className="h-2.5 w-2.5" />
        </Button>
      </div>
    </div>
  )
}