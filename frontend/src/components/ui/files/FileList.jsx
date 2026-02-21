import React from "react";
import { Card } from "../card";
import { ScrollArea } from "../scroll-area";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { FileItem } from "./FileItem";

export const FileList = ({ files, onDelete, onDownload, loading, error }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Загрузка файлов...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          Файлы не найдены
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Загрузите свой первый файл
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-300px)]">
      <div className="space-y-2">
        {files.map((file, index) => (
          <Card key={file.file_id || file.id || index} className="hover:shadow-sm transition-shadow">
            <FileItem 
              file={file}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};