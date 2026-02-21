// components/schedule/schedule-data.js
import { DAYS_OF_WEEK } from './schedule-types'

const TYPE_MAP = {
  'ЛК': 'LECTURE',
  'ПЗ': 'PRACTICAL',
  'ЛР': 'LAB',
  'Консультация': 'CONSULTATION',
  'Экзамен': 'EXAM',
  'КР': 'EXAM',
  'Зачет': 'EXAM',
};

// Функция для вычисления номера недели в цикле 1-4
const calculateWeekNumber = (date, semesterStart) => {
  const timeDiff = date.getTime() - semesterStart.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return (Math.floor(daysDiff / 7) % 4) + 1;
};

// Функция для проверки, попадает ли дата в период занятия
const isDateInLessonRange = (date, startDateStr, endDateStr) => {
  if (!startDateStr || !endDateStr) return true;
  
  const [sDay, sMonth, sYear] = startDateStr.split('.').map(Number);
  const lessonStart = new Date(sYear, sMonth - 1, sDay);
  const [eDay, eMonth, eYear] = endDateStr.split('.').map(Number);
  const lessonEnd = new Date(eYear, eMonth - 1, eDay);
  
  return date >= lessonStart && date <= lessonEnd;
};

// Функция для проверки соответствия недели
const isWeekMatching = (weekNum, lessonWeekNumbers) => {
  if (!lessonWeekNumbers || lessonWeekNumbers.length === 0) return true;
  return lessonWeekNumbers.includes(weekNum);
};

export const fetchScheduleData = async (groupNumber) => {
  if (!groupNumber) {
    return [];
  }

  try {
    const scheduleRes = await fetch(`https://iis.bsuir.by/api/v1/schedule?studentGroup=${groupNumber}`);
    if (!scheduleRes.ok) throw new Error('Failed to fetch schedule');
    const data = await scheduleRes.json();

    // Определяем период отображения (от текущей даты до конца семестра)
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const [startDay, startMonth, startYear] = data.startDate.split('.').map(Number);
    const semesterStart = new Date(startYear, startMonth - 1, startDay);
    semesterStart.setHours(0, 0, 0, 0);

    const [endDay, endMonth, endYear] = data.endDate.split('.').map(Number);
    const semesterEnd = new Date(endYear, endMonth - 1, endDay);
    semesterEnd.setHours(23, 59, 59, 999);

    // Начинаем с текущей даты или с начала семестра
    const startDate = currentDate < semesterStart ? semesterStart : currentDate;

    const schedule = [];

    // Проходим по всем дням от startDate до конца семестра
    for (let date = new Date(startDate); date <= semesterEnd; date.setDate(date.getDate() + 1)) {
      date.setHours(0, 0, 0, 0);
      
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const dayName = DAYS_OF_WEEK[dayIndex];
      const formattedDate = date.toLocaleDateString('ru-RU');
      
      const weekNum = calculateWeekNumber(date, semesterStart);
      
      let lessons = [];

      // Обрабатываем регулярные занятия из schedules
      if (data.schedules && data.schedules[dayName]) {
        data.schedules[dayName].forEach((lesson, lessonIndex) => {
          // Для занятий с конкретной датой
          if (lesson.dateLesson) {
            if (lesson.dateLesson === formattedDate) {
              lessons.push(createLessonObject(lesson, formattedDate, lessonIndex, false));
            }
            return;
          }
          
          // Для регулярных занятий проверяем период и неделю
          if (isDateInLessonRange(date, lesson.startLessonDate, lesson.endLessonDate) &&
              isWeekMatching(weekNum, lesson.weekNumber)) {
            lessons.push(createLessonObject(lesson, formattedDate, lessonIndex, false));
          }
        });
      }

      // Обрабатываем экзамены
      if (data.exams && data.exams.length > 0) {
        data.exams.forEach((exam, examIndex) => {
          if (exam.dateLesson === formattedDate) {
            lessons.push(createLessonObject(exam, formattedDate, examIndex, true));
          }
        });
      }

      // Сортируем занятия по времени начала
      lessons.sort((a, b) => {
        if (!a.startTime || !b.startTime) return 0;
        return a.startTime.localeCompare(b.startTime);
      });

      // ВАЖНО: Добавляем ВСЕ дни, даже если нет занятий
      schedule.push({
        id: `${formattedDate}-${dayName}`,
        name: dayName,
        date: formattedDate,
        fullDate: new Date(date),
        lessons,
        // Добавляем признак пустого дня для удобства
        isEmpty: lessons.length === 0
      });
    }

    return schedule;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
};

// Вспомогательная функция для создания объекта занятия
const createLessonObject = (lesson, formattedDate, index, isExam) => {
  const typeKey = TYPE_MAP[lesson.lessonTypeAbbrev] || (isExam ? 'EXAM' : 'OTHER');
  
  const teacher = lesson.employees && lesson.employees.length > 0 
    ? formatTeacherName(lesson.employees[0])
    : 'Не указан';
    
  const room = lesson.auditories && lesson.auditories.length > 0 
    ? lesson.auditories[0] 
    : 'Не указана';
    
  const time = lesson.startLessonTime && lesson.endLessonTime 
    ? `${lesson.startLessonTime}-${lesson.endLessonTime}`
    : 'Время не указано';

  let groupType = 'group';
  let subgroup = null;
  if (lesson.numSubgroup > 0) {
    groupType = 'subgroup';
    subgroup = lesson.numSubgroup;
  }

  // Создаем стабильный ID для занятия (без случайных значений)
  const lessonId = `${formattedDate}-${isExam ? 'exam' : 'lesson'}-${index}${subgroup ? `-subgroup-${subgroup}` : ''}`;

  return {
    id: lessonId,
    name: lesson.subjectFullName || lesson.subject || (isExam ? 'Экзамен' : 'Занятие'),
    type: typeKey,
    teacher,
    room,
    time,
    startTime: lesson.startLessonTime || '',
    endTime: lesson.endLessonTime || '',
    groupType,
    subgroup,
    task: null,
    note: lesson.note || null,
    isExam
  };
};

// Функция для форматирования имени преподавателя
const formatTeacherName = (employee) => {
  if (!employee) return 'Не указан';
  
  const parts = [
    employee.lastName,
    employee.firstName ? `${employee.firstName.charAt(0)}.` : '',
    employee.middleName ? `${employee.middleName.charAt(0)}.` : ''
  ];
  
  return parts.filter(part => part).join(' ').trim();
};