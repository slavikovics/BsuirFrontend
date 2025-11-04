// components/knowledge/knowledge-section.jsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { Textarea } from "../textarea";
import { ScrollArea } from "../scroll-area";
import { Plus, Search, FileText, Edit, Trash2, Download, X } from "lucide-react";
import { KnowledgeCard } from "./knowledge-card";
import { KnowledgeForm } from "./knowledge-form";
import { useKnowledge } from "./use-knowledge";

export const KnowledgeSection = () => {
  const {
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
  } = useKnowledge();

  const filteredKnowledge = knowledgeItems.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Заголовок и управление */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">База знаний</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Управление учебными материалами и ресурсами
            </p>
          </div>
          <Button onClick={openForm} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Добавить знание
          </Button>
        </div>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Поиск по названию или описанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Сетка знаний */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
            {filteredKnowledge.map((knowledge) => (
              <KnowledgeCard
                key={knowledge.id}
                knowledge={knowledge}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onFileUpload={handleFileUpload}
                onFileRemove={handleFileRemove}
                onDownload={handleDownload}
              />
            ))}
          </div>

          {filteredKnowledge.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'Ничего не найдено' : 'База знаний пуста'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Добавьте первое знание'}
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Форма создания/редактирования */}
      {isFormOpen && (
        <KnowledgeForm
          knowledge={editingKnowledge}
          onSave={saveKnowledge}
          onCancel={closeForm}
        />
      )}
    </div>
  );
};