// components/files/use-files.js
import { useState, useEffect, useCallback } from "react";

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081";

export const useFiles = () => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // JWT
  const getAuthToken = () => localStorage.getItem("jwt_token") || "";

  // Получение userId из токена
  const getUserIdFromToken = () => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.nameid || payload.sub || payload.user_id;
    } catch (err) {
      console.error("Error decoding token:", err);
      return null;
    }
  };

  // Загрузка списка файлов
  const fetchFiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        setError("Требуется авторизация");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/Files/list?limit=100`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
          // без Content-Type!
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Требуется авторизация");
          return;
        }
        throw new Error(await response.text());
      }

      const data = await response.json();
      if (Array.isArray(data)) setFiles(data);
      else if (data?.files) setFiles(data.files);
      else setFiles(Object.values(data).find(Array.isArray) || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getAuthToken() ? fetchFiles() : setError("Требуется авторизация");
  }, [fetchFiles]);

  // Загрузка файла
  const uploadFile = async (formData) => {
    setIsUploading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) throw new Error("Требуется авторизация");

      // ДЕБАГ: Проверяем содержимое FormData перед отправкой
      for (const pair of formData.entries()) {
        console.log("FormData:", pair[0], pair[1]);
      }

      console.log("HEADERS SENT:", [...formData.entries()]);
console.log("FETCH OPTIONS:", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

      const response = await fetch(`${API_BASE_URL}/api/Files/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}` // НЕ ставить Content-Type
        },
        body: formData,
      });

      console.log("REQUEST HEADERS (actual):", response);


      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
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

  // Удаление
  const deleteFile = async (fileId) => {
    try {
      const token = getAuthToken();
      const userId = getUserIdFromToken();

      if (!token) throw new Error("Требуется авторизация");
      if (!userId) throw new Error("Не удалось определить пользователя");

      const response = await fetch(`${API_BASE_URL}/api/Files/delete`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_id: fileId, user_id: userId }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const result = await response.json();
      await fetchFiles();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Скачивание
  const downloadFile = async (file) => {
    try {
      const token = getAuthToken();
      if (!token) throw new Error("Требуется авторизация");

      if (file.direct_url) {
        window.open(file.direct_url, "_blank");
        return;
      }

      console.log("Download file:", file);
      alert(`Скачивание для "${file.filename}" пока не реализовано`);
    } catch (err) {
      setError(err.message);
    }
  };

  return {
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

    handleUploadFile: uploadFile,
    handleDeleteFile: deleteFile,
    handleDownloadFile: downloadFile,
    refreshFiles: fetchFiles,
    clearError: () => setError(null),
  };
};
