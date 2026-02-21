// components/schedule/schedule-analysis.jsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Badge } from "../badge";
import { Brain, Clock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { SimpleMarkdownContent } from "../fixed-markdown-content";

// Компонент индикатора нагрузки
const WorkloadIndicator = ({ level, hours }) => {
  const config = {
    low: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      label: "Низкая нагрузка",
      description: "Отличная неделя для дополнительных задач"
    },
    medium: {
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      label: "Умеренная нагрузка",
      description: "Сбалансированная неделя"
    },
    high: {
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      label: "Высокая нагрузка",
      description: "Требуется планирование приоритетов"
    }
  };

  const { icon: Icon, color, bgColor, borderColor, label, description } = 
    config[level] || config.low;

  return (
    <div className={`flex items-center p-4 rounded-lg border ${bgColor} ${borderColor}`}>
      <Icon className={`h-8 w-8 mr-3 ${color}`} />
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            {label}
          </h3>
          <Badge variant={
            level === 'high' ? 'destructive' : 
            level === 'medium' ? 'secondary' : 
            'default'
          }>
            {hours} часов
          </Badge>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
};

export const ScheduleAnalysis = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="mt-6 bg-white dark:bg-gray-900">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400">
              ИИ анализирует ваше расписание...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  // Данные приходят в camelCase
  const workloadLevel = data.workloadLevel || 'low';
  const estimatedHours = data.estimatedHours || 0;
  const analysis = data.analysis || '';
  const recommendations = data.recommendations || [];
  const timestamp = data.timestamp;

  return (
    <div className="mt-6 space-y-4">
      <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
            <Brain className="h-5 w-5 text-blue-500" />
            Анализ нагрузки
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Индикатор нагрузки */}
          <WorkloadIndicator 
            level={workloadLevel} 
            hours={estimatedHours}
          />

          {/* Анализ в Markdown */}
          {analysis && (
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <SimpleMarkdownContent content={analysis} />
            </div>
          )}

          {/* Рекомендации */}
          {recommendations.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">
                Рекомендации:
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <div className="h-1.5 w-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Временная метка */}
          {timestamp && (
            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-3">
              Анализ выполнен: {new Date(timestamp).toLocaleString('ru-RU')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};