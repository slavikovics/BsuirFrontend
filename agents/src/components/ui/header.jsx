// components/ui/header.jsx
import React, { useState } from "react";
import { Button } from "./button";
import { ThemeToggle } from "./theme-toggle";
import { AuthComponent } from "../auth-component";
import { BookOpen, GraduationCap, Info, MessageSquare, Menu, X } from "lucide-react";

export const Header = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: "schedule", label: "Расписание", icon: BookOpen },
    { id: "knowledge", label: "Знания", icon: GraduationCap },
    { id: "info", label: "О проекте", icon: Info },
    { id: "chat", label: "RAG-чат", icon: MessageSquare },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Логотип и название */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground hidden sm:block">
              Интеллектуальный ассистент по университету
            </h1>
            <h1 className="text-xl font-bold text-foreground sm:hidden">
              Универ-ассистент
            </h1>
          </div>

          {/* Десктопная навигация - кнопки */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  onClick={() => onTabChange(item.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </nav>

          {/* Правая часть: тема, авторизация и мобильное меню */}
          <div className="flex items-center space-x-4">
            {/* Десктопные элементы */}
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <AuthComponent />
            </div>

            {/* Мобильное меню */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              <AuthComponent />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Мобильная навигация */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-800 py-2">
            <div className="flex flex-col space-y-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Индикатор активной вкладки (только для десктопа) - ЗАКОММЕНТИРОВАНО
      <div className="hidden md:block container mx-auto px-4">
        <div className="flex space-x-6 text-sm font-medium border-b border-gray-200 dark:border-gray-800 -mb-px">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`py-3 border-b-2 transition-colors ${
                activeTab === item.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      */}
    </header>
  );
};