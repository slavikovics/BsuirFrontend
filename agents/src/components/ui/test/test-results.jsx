// components/ui/test/test-results.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleMarkdownContent } from "../fixed-markdown-content"
import { CheckCircle2, XCircle } from "lucide-react"

export function TestResults({ results, testData, userAnswers, onRestart }) {
  if (!results) return null

  const correctCount = results.userAnswers.reduce((count, answer, index) => {
    return count + (answer === results.correctAnswers[index] ? 1 : 0)
  }, 0)

  const scorePercentage = Math.round((correctCount / testData.length) * 100)

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Результаты тестирования</h1>
          <div className="inline-flex items-center justify-center rounded-full border px-4 py-2 text-lg font-semibold">
            {correctCount} из {testData.length} правильных ({scorePercentage}%)
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Анализ результатов</CardTitle>
          </CardHeader>
          <CardContent>
            <SimpleMarkdownContent content={results.analysis} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Детализация ответов</h2>
          
          {testData.map((question, questionIndex) => {
            const isCorrect = results.userAnswers[questionIndex] === results.correctAnswers[questionIndex]
            const userAnswerIndex = results.userAnswers[questionIndex]
            const correctAnswerIndex = results.correctAnswers[questionIndex]
            
            const answers = Object.entries(question.answers)
            const userAnswerText = userAnswerIndex !== undefined 
              ? Object.keys(question.answers[userAnswerIndex])[0]
              : "Нет ответа"
            const correctAnswerText = Object.keys(question.answers[correctAnswerIndex])[0]

            return (
              <Card key={questionIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Вопрос {questionIndex + 1}: {question.question}
                    </CardTitle>
                    <Badge 
                      variant={isCorrect ? "default" : "destructive"}
                      className="gap-1"
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Правильно
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Неправильно
                        </>
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Ваш ответ:
                    </p>
                    <div className={`p-3 rounded-lg ${
                      isCorrect 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' 
                        : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                    }`}>
                      {userAnswerText}
                    </div>
                  </div>
                  
                  {!isCorrect && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        Правильный ответ:
                      </p>
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                        {correctAnswerText}
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Все варианты:</span>
                      <ul className="mt-1 space-y-1">
                        {answers.map(([text], idx) => (
                          <li 
                            key={idx} 
                            className={`pl-2 ${
                              idx === correctAnswerIndex 
                                ? 'text-green-600 dark:text-green-400 font-medium' 
                                : 'text-muted-foreground'
                            }`}
                          >
                            {idx === correctAnswerIndex && "✓ "}{text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center space-x-4">
          <Button onClick={onRestart} variant="outline">
            Пройти еще раз
          </Button>
          <Button onClick={onRestart}>
            Новый тест
          </Button>
        </div>
      </div>
    </div>
  )
}