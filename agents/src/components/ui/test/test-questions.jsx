// components/ui/test/test-questions.jsx
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"

export function TestQuestions({ testData, userAnswers, onAnswerSelect, onSubmit }) {
  const answeredCount = Object.keys(userAnswers).length
  const totalQuestions = testData?.length || 0
  
  const allQuestionsAnswered = answeredCount === totalQuestions

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

        <div className="space-y-6">
          {testData?.map((question, questionIndex) => {
            const answers = Object.entries(question.answers)
            
            return (
              <Card key={questionIndex}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Вопрос {questionIndex + 1}: {question.question}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={userAnswers[questionIndex]?.toString() || ""}
                    onValueChange={(value) => onAnswerSelect(questionIndex, parseInt(value))}
                  >
                    {answers.map(([answerText], answerIndex) => (
                      <div key={answerIndex} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem 
                          value={answerIndex.toString()} 
                          id={`q${questionIndex}-a${answerIndex}`}
                        />
                        <Label 
                          htmlFor={`q${questionIndex}-a${answerIndex}`}
                          className="flex-1 cursor-pointer"
                        >
                          {answerText}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-8 flex justify-between">
          <div className="text-sm text-muted-foreground">
            {!allQuestionsAnswered && "Ответьте на все вопросы для завершения теста"}
          </div>
          <Button 
            onClick={onSubmit}
            disabled={!allQuestionsAnswered}
            size="lg"
          >
            Завершить тест
          </Button>
        </div>
      </div>
    </div>
  )
}