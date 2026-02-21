import React from "react";
import { Button } from "../button";
import { Loader2, RefreshCw, Upload } from "lucide-react";

export const FilesHeader = ({ loading, refreshFiles, setShowUploadForm }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h2 className="text-2xl font-bold">Мои файлы</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Управление загруженными файлами
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          onClick={refreshFiles} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Обновить
        </Button>
        <Button 
          onClick={() => setShowUploadForm(true)}
          size="sm"
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Загрузить
        </Button>
      </div>
    </div>
  );
};