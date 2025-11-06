// auth-component.jsx
import { useState, useEffect } from "react"
import { Button } from "./button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { GoogleLogin } from "@react-oauth/google"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { LogOut, User, Settings } from "lucide-react"
import { SettingsDialog } from "./settings-dialog"

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081"

export function AuthComponent() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true)
    }

    window.addEventListener('open-settings', handleOpenSettings)
    
    return () => {
      window.removeEventListener('open-settings', handleOpenSettings)
    }
  }, [])

  // Отправка ID token (credential) на бэкенд для верификации и получения JWT
  const authenticateWithBackend = async (idToken) => {
    try {
      setIsLoading(true)
      console.log("Отправка ID token на бэкенд:", idToken)

      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }), // backend ожидает поле "token"
      })

      console.log("Ответ от бэкенда:", response)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = { message: `HTTP error! status: ${response.status}` }
        }
        throw new Error(errorData.message || "Authentication failed")
      }

      const authData = await response.json()
      console.log("Успешная аутентификация через бэкенд:", authData)

      // backend должен вернуть { token: "<jwt>", user: { ... } }
      if (authData.token) {
        localStorage.setItem("jwt_token", authData.token)
      }
      if (authData.user) {
        localStorage.setItem("user_data", JSON.stringify(authData.user))
        setUser(authData.user)
        setProfile(authData.user)
      }

      return authData
    } catch (error) {
      console.error("Error authenticating with backend:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser)
    setProfile(updatedUser)
    localStorage.setItem("user_data", JSON.stringify(updatedUser))
  }

  // Проверка статус-аутентификации при загрузке компонента
  const checkAuthStatus = async () => {
    const token = localStorage.getItem("jwt_token")
    const savedUser = localStorage.getItem("user_data")

    if (token && savedUser) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setProfile(userData)
        } else {
          // Токен невалиден, очищаем localStorage
          handleLogout()
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        handleLogout()
      }
    }
  }

  // Опционально: получить профиль напрямую у Google (если нужно)
  const getUserInfo = async (accessToken) => {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to get user info from Google")
      }

      return await response.json()
    } catch (error) {
      console.error("Error getting user info:", error)
      throw error
    }
  }

  // Логаут
  const handleLogout = () => {
    fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwt_token")}`,
      },
    }).catch((error) => {
      console.error("Error during logout:", error)
    })

    localStorage.removeItem("jwt_token")
    localStorage.removeItem("user_data")
    setUser(null)
    setProfile(null)
    console.log("Пользователь вышел из системы")
  }

  const getAuthToken = () => {
    return localStorage.getItem("jwt_token")
  }

  useEffect(() => {
    checkAuthStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Оборачиваем fetch для автоматической подстановки JWT в заголовки
  useEffect(() => {
    const originalFetch = window.fetch
    window.fetch = function (...args) {
      const [url, options = {}] = args

      if (
        typeof url === "string" &&
        url.includes(API_BASE_URL) &&
        !url.includes("/api/auth/") &&
        getAuthToken()
      ) {
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }

        return originalFetch(url, newOptions)
      }

      return originalFetch(...args)
    }

    return () => {
      window.fetch = originalFetch
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center space-x-2">
      {user && profile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.pictureUrl} alt={profile.fullName} />
                <AvatarFallback>
                  {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                {profile.groupNumber && (
                  <p className="text-xs leading-none text-muted-foreground">
                    Группа: {profile.groupNumber}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Настройки</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Выйти</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button onClick={() => setIsLoginDialogOpen(true)} disabled={isLoading}>
            {isLoading ? "Загрузка..." : "Войти"}
          </Button>

          <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Вход в систему</DialogTitle>
                <DialogDescription>Войдите через ваш Google аккаунт</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* GoogleLogin из @react-oauth/google возвращает credential (ID token) */}
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setIsLoading(true)
                      const idToken = credentialResponse?.credential
                      if (!idToken) {
                        throw new Error("No credential returned from Google")
                      }

                      // Отправляем ID token (credential) на бэкенд
                      await authenticateWithBackend(idToken)
                      setIsLoginDialogOpen(false)
                    } catch (err) {
                      console.error("Ошибка аутентификации с бэкендом:", err)
                      alert(`Ошибка при входе: ${err.message}`)
                    } finally {
                      setIsLoading(false)
                    }
                  }}
                  onError={() => {
                    alert("Ошибка при входе через Google. Проверьте консоль для деталей.")
                  }}
                  // render the default Google button; if you want a custom UI, use render prop or your own button + google.accounts.id API
                />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Ваши данные будут сохранены в нашей базе данных
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </>
      )}
      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  )
}

// Хук для использования аутентификации в других компонентах
export function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    const savedUser = localStorage.getItem("user_data")

    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const isAuthenticated = !!user
  const getToken = () => localStorage.getItem("jwt_token")

  return {
    user,
    isAuthenticated,
    getToken,
  }
}
