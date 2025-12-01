// components/info/info-section.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Cpu, Network, Brain, Zap } from "lucide-react";

export const InfoSection = () => {
  const features = [
    {
      icon: Cpu,
      title: "AI-агенты",
      description: "Специализированные агенты для расписания, задач и поиска информации"
    },
    {
      icon: Network,
      title: "Микросервисы",
      description: "Архитектура на независимых сервисах для надежности и масштабирования"
    },
    {
      icon: Brain,
      title: "RAG-система",
      description: "Точные ответы на основе ваших учебных материалов и расписания"
    },
    {
      icon: Zap,
      title: "Быстрый отклик",
      description: "Оптимизированная работа с локальными данными и кэшированием"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Заголовок */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Интеллектуальный ассистент по универиситету</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Платформа с ИИ-агентами для управления учебным процессом
          </p>
        </div>

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
            <CardTitle>Технологии</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">Frontend</div>
                <div className="text-muted-foreground">React</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">Архитектура</div>
                <div className="text-muted-foreground">Микросервисы</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">AI</div>
                <div className="text-muted-foreground">RAG + Агенты</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-medium">API</div>
                <div className="text-muted-foreground">REST</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};