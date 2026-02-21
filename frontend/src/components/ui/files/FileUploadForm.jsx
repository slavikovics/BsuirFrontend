import React, { useState } from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Textarea } from "../textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Upload, X, FileText } from "lucide-react";

export const FileUploadForm = ({ onUpload, onCancel, loading }) => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", metadata || "{}");

    try {
      await onUpload(formData);
      setFile(null);
      setMetadata("");
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const FilePreview = () => (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium truncate">{file.name}</p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemoveFile}
          disabled={loading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  const FileUploadArea = () => (
    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors cursor-pointer">
      <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Нажмите для выбора файла</p>
          <p className="text-xs text-muted-foreground">
            или перетащите файл сюда
          </p>
        </div>
        <input
          id="file-upload"
          type="file"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
    </div>
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Загрузить файл</CardTitle>
        <Button variant="ghost" size="icon" onClick={onCancel} disabled={loading}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Файл */}
          <div className="space-y-2">
            <Label htmlFor="file">Файл *</Label>
            {!file ? <FileUploadArea /> : <FilePreview />}
          </div>

          {/* Метаданные */}
          <div className="space-y-2">
            <Label htmlFor="metadata">Метаданные (JSON)</Label>
            <Textarea
              id="metadata"
              value={metadata}
              onChange={(e) => setMetadata(e.target.value)}
              placeholder='{"tags": ["важный"], "category": "документ"}'
              rows={3}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Дополнительные данные в формате JSON
            </p>
          </div>

          {/* Кнопки */}
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={!file || loading}
              className="flex-1"
            >
              {loading ? "Загрузка..." : "Загрузить"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Отмена
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};