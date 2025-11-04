// components/schedule/schedule-data.js (обновленная)
import { DAYS_OF_WEEK, LESSON_TYPES } from './schedule-types'

export const generateScheduleData = () => {
  const subjects = [
    { name: "Математический анализ", teachers: ["Проф. Иванов", "Доц. Петрова"] },
    { name: "Программирование", teachers: ["Проф. Сидоров", "Ст. преп. Козлов"] },
    { name: "Физика", teachers: ["Проф. Николаев", "Доц. Волкова"] },
    { name: "Алгоритмы и структуры данных", teachers: ["Проф. Смирнов"] },
    { name: "Базы данных", teachers: ["Доц. Федорова", "Асс. Ковалев"] },
    { name: "Веб-разработка", teachers: ["Проф. Михайлов"] },
    { name: "Иностранный язык", teachers: ["Доц. Яковлева", "Преп. Морозова"] }
  ]
  
  const rooms = ["101", "202", "303", "404", "505", "Актовый зал", "Комп. класс 1", "Комп. класс 2"]

  const schedule = []
  
  for (let i = 0; i < 120; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    const dayIndex = (date.getDay() + 6) % 7
    const dayName = DAYS_OF_WEEK[dayIndex]
    const formattedDate = date.toLocaleDateString('ru-RU')
    
    const lessons = dayIndex < 5 
      ? Array.from({ length: 2 + Math.floor(Math.random() * 4) }, (_, lessonIndex) => {
          const subject = subjects[Math.floor(Math.random() * subjects.length)]
          const typeKeys = Object.keys(LESSON_TYPES)
          const type = typeKeys[Math.floor(Math.random() * typeKeys.length)]
          
          // Добавляем логику для подгрупп
          let groupType = 'group';
          let subgroup = null;
          
          // Для лабораторных и практических занятий добавляем подгруппы
          if (type === 'LAB' || type === 'PRACTICAL') {
            if (Math.random() > 0.5) { // 50% chance для подгруппы
              groupType = 'subgroup';
              subgroup = Math.random() > 0.5 ? 1 : 2;
            }
          }
          
          return {
            id: `${i}-${lessonIndex}`,
            name: subject.name,
            type: type,
            teacher: subject.teachers[Math.floor(Math.random() * subject.teachers.length)],
            room: rooms[Math.floor(Math.random() * rooms.length)],
            time: `${8 + lessonIndex * 2}:00-${9 + lessonIndex * 2}:50`,
            groupType: groupType,
            subgroup: subgroup,
            task: null // Изначально задач нет
          }
        })
      : []

    schedule.push({
      id: i + 1,
      name: dayName,
      date: formattedDate,
      fullDate: date,
      lessons
    })
  }
  
  return schedule
}