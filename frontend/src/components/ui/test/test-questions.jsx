// components/ui/test/test-questions.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { useEffect } from "react"

export function TestQuestions({ testData, userAnswers, onAnswerSelect, onSubmit }) {
  const answeredCount = Object.keys(userAnswers).length
  const totalQuestions = testData?.length || 0
  
  const allQuestionsAnswered = answeredCount === totalQuestions

  // Проверяем формат данных и логируем для отладки
  useEffect(() => {
    if (testData && testData.length > 0) {
      console.log("Test data format check:", {
        firstQuestion: testData[0],
        answersType: typeof testData[0]?.answers,
        isArray: Array.isArray(testData[0]?.answers),
        answersSample: testData[0]?.answers
      });
    }
  }, [testData]);

  // Функция для получения вариантов ответов в правильном формате
  const getAnswerOptions = (question) => {
    if (!question?.answers) return [];
    
    // Если answers - это массив объектов {text, isCorrect}
    if (Array.isArray(question.answers)) {
      return question.answers.map((answer, index) => ({
        id: index,
        text: answer.text || answer,
        value: index
      }));
    }
    
    // Если answers - это объект вида {"ответ": 0/1} (старый формат)
    if (typeof question.answers === 'object') {
      return Object.entries(question.answers).map(([text, value], index) => ({
        id: index,
        text: text,
        value: index,
        isCorrect: value === 1
      }));
    }
    
    return [];
  };

  // Функция для получения текста вопроса
  const getQuestionText = (question) => {
    if (typeof question === 'string') return question;
    if (question?.question) return question.question;
    return "Вопрос без текста";
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">Тестирование</h2>
            <span className="text-muted-foreground">
              {answeredCount} из {totalQuestions}
            </span>
          </div>
          <Progress value={(answeredCount / totalQuestions) * 100} className="h-2" />
        </div>

        {testData?.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Нет вопросов для отображения
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {testData?.map((question, questionIndex) => {
              const questionText = getQuestionText(question);
              const answerOptions = getAnswerOptions(question);
              
              return (
                <Card key={questionIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Вопрос {questionIndex + 1}: {questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup
                      value={userAnswers[questionIndex]?.toString() || ""}
                      onValueChange={(value) => {
                        console.log(`Selected answer for question ${questionIndex}:`, value);
                        onAnswerSelect(questionIndex, parseInt(value));
                      }}
                    >
                      {answerOptions.length > 0 ? (
                        answerOptions.map((answer) => (
                          <div key={answer.id} className="flex items-center space-x-2 py-2">
                            <RadioGroupItem 
                              value={answer.value.toString()} 
                              id={`q${questionIndex}-a${answer.id}`}
                            />
                            <Label 
                              htmlFor={`q${questionIndex}-a${answer.id}`}
                              className="flex-1 cursor-pointer hover:text-primary transition-colors"
                            >
                              {answer.text}
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="text-muted-foreground py-4 text-center">
                          Нет вариантов ответа
                        </div>
                      )}
                    </RadioGroup>
                    
                    <div className="mt-4 text-sm text-muted-foreground">
                      {userAnswers[questionIndex] !== undefined ? (
                        <span className="text-green-600">
                          Выбран ответ {userAnswers[questionIndex] + 1}
                        </span>
                      ) : (
                        <span className="text-amber-600">
                          Ответ не выбран
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {!allQuestionsAnswered ? (
              <span className="text-amber-600">
                Отвечено {answeredCount} из {totalQuestions} вопросов
              </span>
            ) : (
              <span className="text-green-600">
                Все вопросы отвечены! Можете завершить тест
              </span>
            )}
          </div>
          
          <Button 
            onClick={() => {
              console.log("Submitting test with answers:", userAnswers);
              console.log("Test data:", testData);
              onSubmit();
            }}
            disabled={!allQuestionsAnswered}
            size="lg"
            className="min-w-[200px]"
          >
            {allQuestionsAnswered ? "Завершить тест" : "Ответьте на все вопросы"}
          </Button>
        </div>
      </div>
    </div>
  )
}