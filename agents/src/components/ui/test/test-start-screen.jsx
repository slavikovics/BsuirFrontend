// components/ui/test/test-start-screen.jsx
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TestStartScreen({ onStart }) {
  const [testParams, setTestParams] = useState({
    query: "Создай тест по основам React и современным веб-технологиям",
    maxFiles: 5
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onStart(testParams)
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Тестирование знаний</CardTitle>
          <CardDescription>
            Создайте персонализированный тест на основе ваших материалов или выберите тему
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="query">Тема теста</Label>
                <Textarea
                  id="query"
                  placeholder="Опишите тему или конкретные вопросы для тестирования"
                  value={testParams.query}
                  onChange={(e) => setTestParams({ ...testParams, query: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxFiles">Максимальное количество используемых файлов</Label>
                <Input
                  id="maxFiles"
                  type="number"
                  min="1"
                  max="10"
                  value={testParams.maxFiles}
                  onChange={(e) => setTestParams({ ...testParams, maxFiles: parseInt(e.target.value) })}
                />
              </div>
              
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Как работает тестирование:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Система создаст тест на основе ваших учебных материалов</li>
                  <li>• Тест состоит из 10 вопросов с вариантами ответов</li>
                  <li>• После завершения вы получите подробный анализ результатов</li>
                  <li>• ИИ определит слабые места и даст рекомендации</li>
                </ul>
              </div>
            </div>
            
            <Button type="submit" className="w-full" size="lg">
              Начать тестирование
            </Button>
            
            <div className="text-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onStart({ query: "Базовый тест по программированию", maxFiles: 3 })}
              >
                Использовать демо-тест
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}