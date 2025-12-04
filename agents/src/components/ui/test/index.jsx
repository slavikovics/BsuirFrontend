// components/ui/test/index.jsx
import { useState, useEffect } from "react"
import { TestStartScreen } from "./test-start-screen"
import { TestQuestions } from "./test-questions"
import { TestResults } from "./test-results"

export function TestPage() {
  const [testState, setTestState] = useState("start") // start, loading, questions, results
  const [testData, setTestData] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [userId] = useState("default_user") // В реальном приложении брать из контекста/авторизации

  const startTest = async (testParams) => {
    try {
      setTestState("loading")
      
      // Здесь будет реальный запрос к API
      // const response = await fetch('/api/generate-tests', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     user_id: userId,
      //     query: testParams.query,
      //     max_files: testParams.maxFiles
      //   })
      // });
      // const data = await response.json();
      
      // Для демонстрации используем тест-заглушку
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Тест-заглушка для разработки
      const mockTest = [
        {
          question: "Что такое React?",
          answers: [
            { "Библиотека для построения пользовательских интерфейсов": 1 },
            { "Фреймворк для backend разработки": 0 },
            { "Язык программирования": 0 },
            { "Система управления базами данных": 0 }
          ]
        },
        {
          question: "Какой хук используется для управления состоянием в функциональных компонентах?",
          answers: [
            { "useState": 1 },
            { "useEffect": 0 },
            { "useContext": 0 },
            { "useReducer": 0 }
          ]
        },
        {
          question: "Что такое виртуальный DOM?",
          answers: [
            { "Легковесная копия реального DOM": 1 },
            { "Специальный сервер для рендеринга": 0 },
            { "Браузерный API": 0 },
            { "Тип базы данных": 0 }
          ]
        }
      ]
      
      setTestData(mockTest)
      setTestState("questions")
    } catch (error) {
      console.error("Ошибка при загрузке теста:", error)
      setTestState("start")
    }
  }

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }))
  }

  const submitTest = async () => {
    try {
      setTestState("loading")
      
      // Подготавливаем ответы для отправки
      const formattedAnswers = testData.map((question, index) => ({
        question: question.question,
        user_answer: Object.keys(question.answers[userAnswers[index] || 0])[0],
        correct: Object.values(question.answers[userAnswers[index] || 0])[0] === 1
      }))

      // Здесь будет реальный запрос к API
      // const response = await fetch(`/api/result?user_id=${userId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formattedAnswers)
      // });
      // const data = await response.json();
      
      // Для демонстрации используем моковый ответ
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockResults = {
        analysis: "**Результаты тестирования:**\n\nВы показали хорошее понимание основ React. Особенно хорошо усвоены концепции хуков и виртуального DOM. Рекомендуется обратить внимание на более сложные паттерны, такие как контекст и оптимизация производительности. В целом, уровень подготовки можно оценить как достаточный для продолжения изучения.\n\nДля улучшения результатов рекомендую:\n1. Практиковаться с реальными проектами\n2. Изучить React Router для маршрутизации\n3. Освоить управление состоянием с помощью Redux или Context API",
        correctAnswers: [0, 0, 0], // Индексы правильных ответов
        userAnswers: Object.values(userAnswers)
      }
      
      setResults(mockResults)
      setTestState("results")
    } catch (error) {
      console.error("Ошибка при отправке теста:", error)
      setTestState("questions")
    }
  }

  const restartTest = () => {
    setTestState("start")
    setTestData(null)
    setUserAnswers({})
    setResults(null)
  }

  if (testState === "start") {
    return <TestStartScreen onStart={startTest} />
  }

  if (testState === "loading") {
    return (
      <div className="container mx-auto py-8 flex justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    )
  }

  if (testState === "questions") {
    return (
      <TestQuestions
        testData={testData}
        userAnswers={userAnswers}
        onAnswerSelect={handleAnswerSelect}
        onSubmit={submitTest}
      />
    )
  }

  if (testState === "results") {
    return (
      <TestResults
        results={results}
        testData={testData}
        userAnswers={userAnswers}
        onRestart={restartTest}
      />
    )
  }

  return null
}