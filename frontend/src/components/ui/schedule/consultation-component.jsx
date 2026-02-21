// components/schedule/consultation-component.jsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { SimpleMarkdownContent } from "../fixed-markdown-content";
import { Loader2, MessageSquare, RefreshCw, AlertCircle } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081"

export const ConsultationComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [consultation, setConsultation] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setConsultation(null);

    try {
      const token = localStorage.getItem("jwt_token");
      const response = await await fetch(`${API_BASE_URL}/api/ScheduleAnalysis/consult`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
      }});
      
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Проверяем структуру ответа
      if (data.success && data.data?.markdown) {
        setConsultation({
          markdown: data.data.markdown,
          group: data.data.group,
          timestamp: new Date().toISOString()
        });
      } else {
        // Если структура другая, пробуем получить markdown напрямую
        const markdownText = data.data?.markdown || data.markdown || data.analysis || JSON.stringify(data, null, 2);
        setConsultation({
          markdown: markdownText,
          group: data.data?.group || 'Не указано',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err) {
      setError(err.message);
      console.error('Ошибка при получении консультации:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setConsultation(null);
    setError(null);
  };

  return (
    <Card className="mt-6 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
          <MessageSquare className="h-5 w-5 text-blue-500" />
          Консультация по расписанию
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Начальное состояние - только кнопка */}
        {!isLoading && !consultation && !error && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <MessageSquare className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Нажмите на кнопку, чтобы получить персональную консультацию<br/>
              по вашему расписанию и задачам
            </p>
            <Button 
              onClick={handleGenerate}
              className="mt-2"
            >
              Сгенерировать консультацию
            </Button>
          </div>
        )}

        {/* Состояние загрузки */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              ИИ анализирует ваше расписание и задачи...
            </p>
          </div>
        )}

        {/* Состояние ошибки */}
        {error && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Не удалось получить консультацию</p>
                <p className="text-sm opacity-80">{error}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Попробовать снова
              </Button>
              <Button onClick={handleReset}>
                Начать заново
              </Button>
            </div>
          </div>
        )}

        {/* Отображение консультации */}
        {consultation && !isLoading && (
          <div className="space-y-4">
            {/* Заголовок с информацией о группе */}
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Группа: {consultation.group}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(consultation.timestamp).toLocaleString('ru-RU')}
              </span>
            </div>

            {/* Markdown контент */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg min-h-[200px]">
              <SimpleMarkdownContent content={consultation.markdown} />
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Обновить консультацию
              </Button>
              <Button onClick={handleReset} variant="ghost">
                Скрыть консультацию
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};