import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8080";

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthToken = () => {
    const token = localStorage.getItem("jwt_token");
    return token || "";
  };

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching files...");

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Требуется авторизация");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Files/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }});

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Требуется авторизация");
          return;
        }
        throw new Error(await response.text());
      }

      const data = await response.json();
      console.log("API response:", data);

      // Проверяем структуру ответа
      if (data.success && data.results && Array.isArray(data.results)) {
        console.log(`Found ${data.results.length} files`);
        
        // Преобразуем данные в нужный формат
        const formattedFiles = data.results.map(item => ({
          ...item.payload, // все поля из payload
          file_id: item.id, // добавляем id как file_id
          id: item.id,      // также сохраняем как id для совместимости
          // Переименовываем поля для единообразия
          name: item.payload.filename,
          filename: item.payload.filename,
          size: item.payload.file_size,
          file_size: item.payload.file_size,
          upload_date: item.payload.uploaded_at,
          uploaded_at: item.payload.uploaded_at,
          user_id: item.payload.user_id
        }));
        
        console.log("Formatted files:", formattedFiles);
        setFiles(formattedFiles);
      } else {
        console.log("Invalid response format or no files:", data);
        setFiles([]);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Ошибка загрузки файлов");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchFiles();
    } else {
      setError("Требуется авторизация");
      setLoading(false);
    }
  }, [fetchFiles]);

  // Загрузка файла
  const uploadFile = async (formData) => {
    setIsUploading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Требуется авторизация");

      const response = await fetch(`${API_BASE_URL}/api/Files/add`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      console.log("Upload result:", result);
      
      await fetchFiles();
      setShowUploadForm(false);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  // Удаление файла
  const deleteFile = async (fileId) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Требуется авторизация");

      console.log("Deleting file:", { file_id: fileId });

      const response = await fetch(`${API_BASE_URL}/api/Files/delete`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          FileId: fileId
        }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      console.log("Delete result:", result);
      
      await fetchFiles();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    files,
    searchTerm,
    isUploading,
    showUploadForm,
    loading,
    error,
    setSearchTerm,
    setShowUploadForm,
    handleUploadFile: uploadFile,
    handleDeleteFile: deleteFile,
    refreshFiles: fetchFiles,
    clearError: () => setError(null),
  };
};