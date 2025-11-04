// components/knowledge/use-knowledge.js
import { useState, useEffect } from "react";

// Моковые данные для демонстрации
const initialKnowledge = [
  {
    id: 1,
    title: "Основы алгоритмов и структур данных",
    description: "Введение в базовые алгоритмы, структуры данных и их применение в программировании.",
    file: null
  },
  {
    id: 2,
    title: "Математический анализ",
    description: "Фундаментальные понятия математического анализа: пределы, производные, интегралы.",
    file: {
      name: "math_analysis_lectures.pdf",
      size: 2456789
    }
  },
  {
    id: 3,
    title: "Веб-разработка",
    description: "Современные технологии веб-разработки: HTML, CSS, JavaScript, фреймворки.",
    file: null
  }
];

export const useKnowledge = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingKnowledge, setEditingKnowledge] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Загрузка данных при монтировании
  useEffect(() => {
    const saved = localStorage.getItem("university-knowledge");
    if (saved) {
      setKnowledgeItems(JSON.parse(saved));
    } else {
      setKnowledgeItems(initialKnowledge);
    }
  }, []);

  // Сохранение при изменении
  useEffect(() => {
    localStorage.setItem("university-knowledge", JSON.stringify(knowledgeItems));
  }, [knowledgeItems]);

  const handleCreate = () => {
    setEditingKnowledge(null);
    setIsFormOpen(true);
  };

  const handleEdit = (knowledge) => {
    setEditingKnowledge(knowledge);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Вы уверены, что хотите удалить это знание?")) {
      setKnowledgeItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleFileUpload = (id, file) => {
    setKnowledgeItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, file: { name: file.name, size: file.size } }
          : item
      )
    );
  };

  const handleFileRemove = (id) => {
    setKnowledgeItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, file: null } : item
      )
    );
  };

  const handleDownload = (id) => {
    const knowledge = knowledgeItems.find(item => item.id === id);
    if (knowledge?.file) {
      // Имитация скачивания
      alert(`Скачивание файла: ${knowledge.file.name}`);
    }
  };

  const saveKnowledge = (knowledgeData) => {
    if (knowledgeData.id) {
      // Редактирование
      setKnowledgeItems(prev =>
        prev.map(item =>
          item.id === knowledgeData.id ? knowledgeData : item
        )
      );
    } else {
      // Создание
      const newKnowledge = {
        ...knowledgeData,
        id: Date.now(),
        file: null
      };
      setKnowledgeItems(prev => [...prev, newKnowledge]);
    }
    setIsFormOpen(false);
    setEditingKnowledge(null);
  };

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingKnowledge(null);
  };

  return {
    knowledgeItems,
    searchTerm,
    editingKnowledge,
    isFormOpen,
    setSearchTerm,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFileUpload,
    handleFileRemove,
    handleDownload,
    openForm,
    closeForm,
    saveKnowledge
  };
};