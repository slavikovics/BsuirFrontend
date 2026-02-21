// components/ui/test/test-results.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SimpleMarkdownContent } from "../fixed-markdown-content"
import { CheckCircle2, XCircle } from "lucide-react"

export function TestResults({ results, testData, userAnswers, onRestart }) {
  if (!results || !testData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Результаты не найдены</p>
        </div>
      </div>
    )
  }

  // Функция для получения текста вопроса
  const getQuestionText = (question) => {
    if (typeof question === 'string') return question;
    if (question?.question) return question.question;
    return "Вопрос без текста";
  };

  // Функция для получения вариантов ответов
  const getAnswerOptions = (question) => {
    if (!question?.answers) return [];
    
    if (Array.isArray(question.answers)) {
      return question.answers.map((answer, index) => ({
        index,
        text: answer.text || answer,
        isCorrect: answer.isCorrect
      }));
    }
    
    if (typeof question.answers === 'object') {
      return Object.entries(question.answers).map(([text, value], index) => ({
        index,
        text: text,
        isCorrect: value === 1
      }));
    }
    
    return [];
  };

  // Функция для получения правильного ответа
  const getCorrectAnswerIndex = (question) => {
    const answers = getAnswerOptions(question);
    const correctAnswer = answers.find(a => a.isCorrect);
    return correctAnswer ? correctAnswer.index : 0;
  };

  // Функция для получения текста ответа по индексу
  const getAnswerTextByIndex = (question, index) => {
    const answers = getAnswerOptions(question);
    return answers[index]?.text || "Ответ не найден";
  };

  // Подсчет правильных ответов
  const correctCount = testData.reduce((count, question, index) => {
    const userAnswerIndex = userAnswers[index];
    if (userAnswerIndex === undefined || userAnswerIndex === null) return count;
    
    const answers = getAnswerOptions(question);
    const userAnswer = answers[userAnswerIndex];
    const correctAnswer = answers.find(a => a.isCorrect);
    
    return count + (userAnswer?.isCorrect ? 1 : 0);
  }, 0);

  const scorePercentage = Math.round((correctCount / testData.length) * 100)
  
  // Получение цветов для оценки
  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (percentage) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold dark:text-white">Результаты тестирования</h1>
          <div className={`inline-flex items-center justify-center rounded-full border dark:border-gray-700 px-6 py-3 text-xl font-bold ${getScoreColor(scorePercentage)}`}>
            <span className="text-2xl mr-2">{correctCount}</span>
            <span className="text-muted-foreground dark:text-gray-400">из</span>
            <span className="mx-2 text-2xl dark:text-white">{testData.length}</span>
            <span className="text-muted-foreground dark:text-gray-400">правильно</span>
            <span className="mx-2 dark:text-gray-500">•</span>
            <span className="text-2xl">{scorePercentage}%</span>
          </div>
          
          <Badge variant={getScoreBadgeVariant(scorePercentage)} className="text-base py-1 px-4">
            {scorePercentage >= 80 ? "Отлично" : 
             scorePercentage >= 60 ? "Хорошо" : 
             "Нужно подтянуть знания"}
          </Badge>
        </div>

        {results.analysis && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 dark:text-white">
                <CheckCircle2 className="h-5 w-5" />
                Анализ результатов
              </CardTitle>
            </CardHeader>
            <CardContent className="dark:text-gray-300">
              <SimpleMarkdownContent content={results.analysis} />
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          <h2 className="text-2xl font-bold dark:text-white">Детализация ответов</h2>
          
          {testData.map((question, questionIndex) => {
            const questionText = getQuestionText(question);
            const userAnswerIndex = userAnswers[questionIndex];
            const correctAnswerIndex = getCorrectAnswerIndex(question);
            const isCorrect = userAnswerIndex !== undefined && 
                            userAnswerIndex !== null && 
                            getAnswerOptions(question)[userAnswerIndex]?.isCorrect;
            
            const userAnswerText = userAnswerIndex !== undefined && userAnswerIndex !== null 
              ? getAnswerTextByIndex(question, userAnswerIndex)
              : "Нет ответа";
              
            const correctAnswerText = getAnswerTextByIndex(question, correctAnswerIndex);
            const allAnswers = getAnswerOptions(question);

            return (
              <Card 
                key={questionIndex} 
                className={`
                  dark:bg-gray-800 dark:border-gray-700
                  ${isCorrect 
                    ? "border-green-200 dark:border-green-800" 
                    : "border-red-200 dark:border-red-800"
                  }
                `}
              >
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <CardTitle className="text-lg dark:text-white">
                      <span className="text-muted-foreground dark:text-gray-400">Вопрос {questionIndex + 1}:</span> {questionText}
                    </CardTitle>
                    <Badge 
                      variant={isCorrect ? "default" : "destructive"}
                      className="gap-1 self-start sm:self-center"
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
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                        Ваш ответ:
                      </p>
                      <div className={`
                        p-4 rounded-lg border
                        ${isCorrect 
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                          : 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                        }
                      `}>
                        <div className="flex items-start gap-2">
                          {isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span>{userAnswerText}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!isCorrect && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">
                          Правильный ответ:
                        </p>
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                            <span>{correctAnswerText}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-3">
                      Все варианты ответа:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {allAnswers.map((answer, idx) => (
                        <div 
                          key={idx} 
                          className={`
                            p-3 rounded-lg border transition-all
                            ${answer.isCorrect 
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300' 
                              : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-400'
                            }
                            ${idx === userAnswerIndex ? 'ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-500' : ''}
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`
                              w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0
                              ${answer.isCorrect 
                                ? 'border-green-500 dark:border-green-400 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                                : 'border-gray-300 dark:border-gray-600'
                              }
                            `}>
                              {idx === userAnswerIndex && !answer.isCorrect && (
                                <XCircle className="h-4 w-4 text-red-500 dark:text-red-400" />
                              )}
                              {answer.isCorrect && (
                                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              )}
                            </div>
                            <span className="flex-1">{answer.text}</span>
                            {answer.isCorrect && (
                              <Badge variant="outline" className="text-green-600 dark:text-green-400 border-green-300 dark:border-green-700">
                                Правильный
                              </Badge>
                            )}
                            {idx === userAnswerIndex && !answer.isCorrect && (
                              <Badge variant="outline" className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-700">
                                Ваш выбор
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 border-t dark:border-gray-700">
          <Button 
            onClick={onRestart} 
            variant="outline" 
            size="lg"
            className="min-w-[200px] dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Пройти тест заново
          </Button>
          <Button 
            onClick={onRestart} 
            size="lg"
            className="min-w-[200px] dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
          >
            Новый тест
          </Button>
        </div>
      </div>
    </div>
  )
}