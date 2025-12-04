import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { FileUploadForm } from "./FileUploadForm";
import { FileList } from "./FileList";
import { FileStats } from "./FileStats";
import { FileSearch } from "./FileSearch";
import { FilesHeader } from "./FilesHeader";
import { useFiles } from "./use-files";

export const FilesSection = () => {
  const {
    files,
    searchTerm,
    isUploading,
    showUploadForm,
    loading,
    error,
    setSearchTerm,
    setShowUploadForm,
    handleUploadFile,
    handleDeleteFile,
    handleDownloadFile,
    refreshFiles,
    clearError
  } = useFiles();

  console.log("FilesSection state:", {
    totalFiles: files.length,
    searchTerm,
    loading,
    error
  });

  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    const filename = file.filename || file.name || "";
    const metadata = file.metadata || "";
    
    return (
      filename.toLowerCase().includes(searchLower) ||
      (typeof metadata === 'string' && metadata.toLowerCase().includes(searchLower)) ||
      (typeof metadata === 'object' && JSON.stringify(metadata).toLowerCase().includes(searchLower))
    );
  });

  console.log("Filtered files:", filteredFiles.length);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-4">
        {/* Заголовок и управление */}
        <FilesHeader 
          loading={loading}
          refreshFiles={refreshFiles}
          setShowUploadForm={setShowUploadForm}
        />

        {/* Статистика */}
        <FileStats files={files} />

        {/* Поиск и список файлов */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Список файлов</CardTitle>
              <FileSearch 
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              />
            </div>
          </CardHeader>
          <CardContent>
            <FileList
              files={filteredFiles}
              onDelete={handleDeleteFile}
              onDownload={handleDownloadFile}
              loading={loading}
              error={error}
            />
          </CardContent>
        </Card>
      </div>

      {/* Форма загрузки файла */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <FileUploadForm
            onUpload={handleUploadFile}
            onCancel={() => {
              setShowUploadForm(false);
              clearError();
            }}
            loading={isUploading}
          />
        </div>
      )}
    </div>
  );
};