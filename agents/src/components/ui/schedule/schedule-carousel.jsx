// components/schedule/schedule-carousel.jsx
import { ScheduleCard } from "./schedule-card"

export const ScheduleCarousel = ({
  schedule,
  expandedDayIndex,
  scrollContainerRef,
  onDayClick,
  onAddTaskClick,
  onTaskClick,
  onMouseDown,
  onMouseLeave,
  onMouseUp,
  onMouseMove
}) => {
  return (
    <div 
      ref={scrollContainerRef}
      className="flex overflow-x-auto py-5 space-x-4 scrollbar-hide select-none px-4 -mx-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onMouseDown={onMouseDown}
      onMouseLeave={onMouseLeave}
      onMouseUp={onMouseUp}
      onMouseMove={onMouseMove}
    >
      {schedule.map((day, index) => (
        <ScheduleCard
          key={day.id}
          day={day}
          index={index}
          isExpanded={expandedDayIndex === index}
          onDayClick={onDayClick}
          onAddTaskClick={onAddTaskClick}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  )
}