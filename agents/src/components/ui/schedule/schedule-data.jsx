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

export const fetchScheduleData = async (groupNumber) => { // ← ДОБАВЛЯЕМ ПАРАМЕТР
  if (!groupNumber) {
    return []; // ← ВОЗВРАЩАЕМ ПУСТОЙ МАССИВ ЕСЛИ ГРУППА НЕ УКАЗАНА
  }

  try {
    const currentWeekRes = await fetch('https://iis.bsuir.by/api/v1/schedule/current-week');
    if (!currentWeekRes.ok) throw new Error('Failed to fetch current week');
    const currentWeek = await currentWeekRes.json();

    const scheduleRes = await fetch(`https://iis.bsuir.by/api/v1/schedule?studentGroup=${groupNumber}`); // ← ИСПОЛЬЗУЕМ groupNumber
    if (!scheduleRes.ok) throw new Error('Failed to fetch schedule');
    const data = await scheduleRes.json();

    const [startDay, startMonth, startYear] = data.startDate.split('.').map(Number);
    const semesterStart = new Date(startYear, startMonth - 1, startDay);

    const [endDay, endMonth, endYear] = data.endDate.split('.').map(Number);
    const semesterEnd = new Date(endYear, endMonth - 1, endDay);

    const currentDate = new Date()

    const schedule = [];

    for (let i = 0; i < 120; i++) {
      const date = new Date(currentDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      const dayName = DAYS_OF_WEEK[dayIndex];
      const formattedDate = date.toLocaleDateString('ru-RU');

      const daysFromStart = Math.floor((date - semesterStart) / (24 * 60 * 60 * 1000));
      const weekNum = Math.max(1, (Math.floor(daysFromStart / 7) % 4) + 1);

      const isWithinSemester = date >= semesterStart && date <= semesterEnd;

      let lessons = [];

      if (isWithinSemester && data.schedules[dayName]) {
        lessons = data.schedules[dayName]
          .filter(lesson => {
            if (lesson.weekNumber && !lesson.weekNumber.includes(weekNum)) return false;

            if (lesson.startLessonDate && lesson.endLessonDate) {
              const [sDay, sMonth, sYear] = lesson.startLessonDate.split('.').map(Number);
              const lessonStart = new Date(sYear, sMonth - 1, sDay);
              const [eDay, eMonth, eYear] = lesson.endLessonDate.split('.').map(Number);
              const lessonEnd = new Date(eYear, eMonth - 1, eDay);
              if (date < lessonStart || date > lessonEnd) return false;
            }

            return true;
          })
          .map((lesson, lessonIndex) => {
            const typeKey = TYPE_MAP[lesson.lessonTypeAbbrev] || 'CONSULTATION';
            const teacher = lesson.employees?.[0] ? `${lesson.employees[0].lastName} ${lesson.employees[0].firstName.charAt(0)}. ${lesson.employees[0].middleName ? lesson.employees[0].middleName.charAt(0) + '.' : ''}`.trim() : 'Не указан';
            const room = lesson.auditories?.[0] || 'Не указана';
            const time = `${lesson.startLessonTime}-${lesson.endLessonTime}`;

            let groupType = 'group';
            let subgroup = null;
            if (lesson.numSubgroup > 0) {
              groupType = 'subgroup';
              subgroup = lesson.numSubgroup;
            }

            return {
              id: `${formattedDate}-${lessonIndex}`,
              name: lesson.subjectFullName || lesson.subject,
              type: typeKey,
              teacher,
              room,
              time,
              groupType,
              subgroup,
              task: null,
              note: lesson.note || null
            };
          });
      }

      data.exams
        .filter(exam => exam.dateLesson === formattedDate)
        .forEach((exam, examIndex) => {
          const typeKey = TYPE_MAP[exam.lessonTypeAbbrev] || 'EXAM';
          const teacher = exam.employees?.[0] ? `${exam.employees[0].lastName} ${exam.employees[0].firstName.charAt(0)}. ${exam.employees[0].middleName ? exam.employees[0].middleName.charAt(0) + '.' : ''}`.trim() : 'Не указан';
          const room = exam.auditories?.[0] || 'Не указана';
          const time = `${exam.startLessonTime}-${exam.endLessonTime}`;

          let groupType = 'group';
          let subgroup = null;
          if (exam.numSubgroup > 0) {
            groupType = 'subgroup';
            subgroup = exam.numSubgroup;
          }

          lessons.push({
            id: `${formattedDate}-exam-${examIndex}`,
            name: exam.subjectFullName || exam.subject,
            type: typeKey,
            teacher,
            room,
            time,
            groupType,
            subgroup,
            task: null,
            note: exam.note || null,
            isExam: true
          });
        });

      lessons.sort((a, b) => a.time.localeCompare(b.time));

      schedule.push({
        id: i + 1,
        name: dayName,
        date: formattedDate,
        fullDate: new Date(date),
        lessons
      });
    }

    return schedule;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }
};