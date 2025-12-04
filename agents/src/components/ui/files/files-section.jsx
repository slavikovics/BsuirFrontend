// components/files/files-section.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Button } from "../button";
import { Input } from "../input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";
import { 
  Plus, 
  Search, 
  Upload, 
  Grid, 
  List, 
  Loader2,
  RefreshCw,
  Filter,
  Folder,
  Calendar,
  User,
  FileText
} from "lucide-react";
import { FileUploadForm } from "./file-upload-form";
import { FileList } from "./file-list";
import { useFiles } from "./use-files";

export const FilesSection = () => {
  const {
    files,
    searchTerm,
    viewMode,
    isUploading,
    showUploadForm,
    loading,
    error,
    setSearchTerm,
    setViewMode,
    setShowUploadForm,
    handleUploadFile,
    handleDeleteFile,
    handleDownloadFile,
    refreshFiles,
    clearError
  } = useFiles();

  const filteredFiles = files.filter(file => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (file.filename || file.name)?.toLowerCase().includes(searchLower) ||
      (file.metadata && JSON.stringify(file.metadata).toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        {/* Заголовок и управление */}
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
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Загрузить
            </Button>
          </div>
        </div>

        {/* Тайлы */}
        <Tabs defaultValue="all" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList>
              <TabsTrigger value="all">Все файлы</TabsTrigger>
              <TabsTrigger value="documents">Документы</TabsTrigger>
              <TabsTrigger value="images">Изображения</TabsTrigger>
              <TabsTrigger value="archives">Архивы</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Поиск файлов..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className="h-10 w-10 rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className="h-10 w-10 rounded-l-none border-l"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="all" className="space-y-4">
            {/* Статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Всего файлов</p>
                      <p className="text-2xl font-bold">{files.length}</p>
                    </div>
                    <Folder className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Общий размер</p>
                      <p className="text-2xl font-bold">
                        {files.reduce((acc, file) => acc + (file.file_size || 0), 0) / 1024 / 1024 > 1024
                          ? `${(files.reduce((acc, file) => acc + (file.file_size || 0), 0) / 1024 / 1024 / 1024).toFixed(2)} GB`
                          : `${(files.reduce((acc, file) => acc + (file.file_size || 0), 0) / 1024 / 1024).toFixed(2)} MB`
                        }
                      </p>
                    </div>
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Последняя загрузка</p>
                      <p className="text-lg font-bold truncate">
                        {files.length > 0 
                          ? new Date(Math.max(...files.map(f => new Date(f.upload_date || f.created_at))))?.toLocaleDateString("ru-RU")
                          : "Нет файлов"
                        }
                      </p>
                    </div>
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Список файлов */}
            <Card>
              <CardHeader>
                <CardTitle>Файлы</CardTitle>
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
          </TabsContent>
          
          {/* Остальные табы можно заполнить позже */}
          <TabsContent value="documents">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Документы будут отображаться здесь</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="images">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Изображения будут отображаться здесь</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="archives">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Архивы будут отображаться здесь</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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