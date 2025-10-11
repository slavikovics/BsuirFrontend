// components/auth-component.jsx
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { useGoogleLogin, googleLogout } from "@react-oauth/google"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { LogOut, User, Settings } from "lucide-react"

export function AuthComponent() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)

  // Функция для получения данных пользователя
  const fetchUserProfile = async (accessToken) => {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      const userInfo = await response.json()
      setProfile(userInfo)
      return userInfo
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return null
    }
  }

  // Реальный вход через Google OAuth
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Успешный вход, токен:", tokenResponse)
      setUser(tokenResponse)
      
      // Получаем данные пользователя
      const userProfile = await fetchUserProfile(tokenResponse.access_token)
      if (userProfile) {
        console.log("Данные пользователя:", userProfile)
      }
      
      setIsLoginDialogOpen(false)
    },
    onError: (error) => {
      console.log("Ошибка входа:", error)
      alert("Ошибка при входе через Google. Проверьте консоль для деталей.")
    },
    scope: "openid profile email", // Запрашиваемые разрешения
  })

  const handleLogout = () => {
    if (user) {
      googleLogout()
    }
    setUser(null)
    setProfile(null)
    console.log("Пользователь вышел из системы")
  }

  // Проверяем сохраненную сессию при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('google_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      
      // Если есть access token, получаем профиль
      if (userData.access_token) {
        fetchUserProfile(userData.access_token)
      }
    }
  }, [])

  // Сохраняем пользователя в localStorage при изменении
  useEffect(() => {
    if (user) {
      localStorage.setItem('google_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('google_user')
    }
  }, [user])

  return (
    <div className="flex items-center space-x-2">
      {user && profile ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile.picture} alt={profile.name} />
                <AvatarFallback>
                  {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {profile.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Профиль</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
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
        <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Вход в систему</DialogTitle>
              <DialogDescription>
                Войдите через ваш Google аккаунт
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button 
                onClick={() => login()} 
                variant="outline" 
                className="w-full"
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Войти через Google
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  После входа вы увидите ваши реальные данные из Google аккаунта
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Кнопка для открытия диалога входа */}
      {!user && (
        <Button onClick={() => setIsLoginDialogOpen(true)}>
          Войти
        </Button>
      )}
    </div>
  )
}