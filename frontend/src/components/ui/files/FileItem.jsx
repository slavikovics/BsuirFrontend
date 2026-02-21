import React from "react";
import { CardContent } from "../card";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../tooltip";
import { FileText, Trash2 } from "lucide-react";

export const FileItem = ({ file, onDelete, onDownload }) => {
  const getFileIcon = (filename) => {
    if (!filename) return <FileText className="h-5 w-5" />;
    
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'docx':
      case 'doc':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'xlsx':
      case 'xls':
        return <FileText className="h-5 w-5 text-green-600" />;
      case 'zip':
      case 'rar':
        return <FileText className="h-5 w-5 text-yellow-500" />;
      case 'txt':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Получаем имя файла из разных возможных полей
  const filename = file.filename || file.name || "Без названия";
  const fileId = file.file_id || file.id;
  const fileSize = file.file_size || file.size;
  const fileType = file.file_type;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <CardContent className="p-3">
      <div className="flex items-center justify-between">
        {/* Информация о файле */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex-shrink-0">
            {getFileIcon(filename)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium truncate text-sm">
              {filename}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{fileType?.toUpperCase() || "ФАЙЛ"}</span>
              <span>•</span>
              <span>{formatFileSize(fileSize)}</span>
            </div>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(fileId)}
                  className="h-7 w-7 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Удалить</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </CardContent>
  );
};