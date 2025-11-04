// components/knowledge/knowledge-card.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { FileText, Edit, Trash2, Download, X, Paperclip } from "lucide-react";

export const KnowledgeCard = ({
  knowledge,
  onEdit,
  onDelete,
  onFileUpload,
  onFileRemove,
  onDownload
}) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(knowledge.id, file);
    }
  };

  const getFileIcon = (filename) => {
    if (!filename) return <Paperclip className="h-4 w-4" />;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-start">
          <span className="line-clamp-2 flex-1 mr-2">{knowledge.title}</span>
          <div className="flex gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(knowledge)}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(knowledge.id)}
              className="h-8 w-8 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Описание */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {knowledge.description}
        </p>

        {/* Файл */}
        <div className="flex items-center justify-between">
          {knowledge.file ? (
            <div className="flex items-center gap-2 flex-1">
              {getFileIcon(knowledge.file.name)}
              <span className="text-sm truncate flex-1">
                {knowledge.file.name}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDownload(knowledge.id)}
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onFileRemove(knowledge.id)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex-1">
                <Paperclip className="h-4 w-4" />
                <span>Прикрепить файл</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>

        {/* Информация о файле */}
        {knowledge.file && (
          <div className="text-xs text-muted-foreground">
            Размер: {(knowledge.file.size / 1024 / 1024).toFixed(2)} MB
          </div>
        )}
      </CardContent>
    </Card>
  );
};