// components/info/info-section.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { BookOpen, Users, Target, Code } from "lucide-react";

export const InfoSection = () => {
  const features = [
    {
      icon: BookOpen,
      title: "Умное расписание",
      description: "Интеллектуальное управление занятиями и задачами с автоматическим планированием"
    },
    {
      icon: Users,
      title: "Персонализация",
      description: "Адаптация под ваши учебные потребности и предпочтения"
    },
    {
      icon: Target,
      title: "RAG-технологии",
      description: "Продвинутый поиск и анализ информации с использованием Retrieval-Augmented Generation"
    },
    {
      icon: Code,
      title: "Современный стек",
      description: "Построено на современных технологиях для максимальной производительности"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Интеллектуальный ассистент по университету</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Современная платформа для управления учебным процессом, объединяющая расписание, 
            базу знаний и интеллектуальный помощник
          </p>
        </div>

        {/* Основная информация */}
        <Card>
          <CardHeader>
            <CardTitle>О проекте</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Этот проект представляет собой комплексное решение для студентов и преподавателей, 
              объединяющее в себе функции управления расписанием, хранения учебных материалов 
              и интеллектуального ассистента на основе RAG-технологий.
            </p>
            
            <p>
              <strong>Основные возможности:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
              <li>Интеллектуальное расписание с управлением задачами</li>
              <li>База знаний с поддержкой различных форматов файлов</li>
              <li>RAG-чат для получения контекстных ответов</li>
              <li>Адаптивный интерфейс для всех устройств</li>
              <li>Локальное хранение данных для конфиденциальности</li>
            </ul>
          </CardContent>
        </Card>

        {/* Особенности */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4 space-y-0">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Технологии */}
        <Card>
          <CardHeader>
            <CardTitle>Технологический стек</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">Frontend</div>
                <div className="text-muted-foreground">React + Tailwind</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">UI Components</div>
                <div className="text-muted-foreground">shadcn/ui</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">AI</div>
                <div className="text-muted-foreground">RAG Architecture</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">Storage</div>
                <div className="text-muted-foreground">LocalStorage</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};