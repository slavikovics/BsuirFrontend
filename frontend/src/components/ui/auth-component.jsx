// auth-component.jsx
import { useState, useEffect, useCallback } from "react"
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

// Utility function to check if token is expired or about to expire
const isTokenExpiredOrExpiring = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
    
    return now >= (exp - bufferTime);
  } catch (error) {
    console.error("Error parsing token:", error);
    return true;
  }
};

// Store original fetch for auth endpoints
const originalFetch = window.fetch.bind(window);

// Enhanced fetch function with automatic token refresh
const authFetch = async (url, options = {}) => {
  let token = localStorage.getItem("jwt_token");
  
  // Check if token needs refresh (skip for auth endpoints)
  if (token && !url.includes('/api/auth/') && isTokenExpiredOrExpiring(token)) {
    try {
      console.log("Token expired or expiring, attempting refresh...");
      await refreshToken();
      token = localStorage.getItem("jwt_token"); // Get new token
    } catch (error) {
      console.error("Failed to refresh token:", error);
      throw new Error("Authentication required");
    }
  }

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
  headers["Content-Type"] = "application/json";
}

  // Add Authorization header for non-auth endpoints
  if (token && !url.includes('/api/auth/')) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await originalFetch(url, {
    ...options,
    headers,
  });

  // If token is invalid, try to refresh and retry once (skip for auth endpoints)
  if (response.status === 401 && token && !url.includes('/api/auth/')) {
    try {
      console.log("Received 401, attempting token refresh...");
      await refreshToken();
      const newToken = localStorage.getItem("jwt_token");
      
      // Retry the request with new token
      headers["Authorization"] = `Bearer ${newToken}`;
      return await originalFetch(url, {
        ...options,
        headers,
      });
    } catch (refreshError) {
      console.error("Refresh failed after 401:", refreshError);
      handleLogout();
      throw new Error("Authentication failed");
    }
  }

  return response;
};

// Refresh token function
const refreshToken = async () => {
  const token = localStorage.getItem("jwt_token");
  if (!token) {
    throw new Error("No token available");
  }

  try {
    const response = await originalFetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const authData = await response.json();
    
    if (authData.token) {
      localStorage.setItem("jwt_token", authData.token);
    }
    if (authData.user) {
      localStorage.setItem("user_data", JSON.stringify(authData.user));
    }

    return authData;
  } catch (error) {
    console.error("Token refresh failed:", error);
    // If refresh fails, clear storage
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user_data");
    throw error;
  }
};

// Logout function
const handleLogout = () => {
  // Try to call logout endpoint, but don't block if it fails
  originalFetch(`${API_BASE_URL}/api/auth/logout`, {
    method: "POST",
  }).catch((error) => {
    console.error("Error during logout:", error);
  });

  const allKeys = Object.keys(localStorage);
  
  allKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

export function AuthComponent() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    const handleOpenSettings = () => {
      setIsSettingsOpen(true)
    }

    window.addEventListener('open-settings', handleOpenSettings)
    
    return () => {
      window.removeEventListener('open-settings', handleOpenSettings)
    }
  }, [])

  // Enhanced authenticate function
  const authenticateWithBackend = async (idToken) => {
    try {
      setIsLoading(true)
      console.log("Sending ID token to backend:", idToken)

      const response = await originalFetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: idToken }),
      })

      console.log("Backend response:", response)

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
      console.log("Successful authentication:", authData)

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

  // Enhanced auth status check
  const checkAuthStatus = useCallback(async () => {
    const token = localStorage.getItem("jwt_token")
    const savedUser = localStorage.getItem("user_data")

    if (token && savedUser) {
      // Check if token is expired
      if (isTokenExpiredOrExpiring(token)) {
        console.log("Token needs refresh on app load");
        try {
          await refreshToken();
          // After refresh, get the updated user data
          const refreshedUser = localStorage.getItem("user_data");
          if (refreshedUser) {
            setUser(JSON.parse(refreshedUser));
            setProfile(JSON.parse(refreshedUser));
          }
          setIsCheckingAuth(false);
          return;
        } catch (error) {
          console.error("Token refresh failed on app load:", error);
          setIsCheckingAuth(false);
          return;
        }
      }

      try {
        const response = await authFetch(`${API_BASE_URL}/api/users/me`)
        
        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setProfile(userData)
          localStorage.setItem("user_data", JSON.stringify(userData))
        } else {
          // If we have saved user data but API call fails, still show the user
          // but mark as potentially stale
          const savedUserData = JSON.parse(savedUser);
          setUser(savedUserData);
          setProfile(savedUserData);
          console.warn("API call failed, using cached user data");
        }
      } catch (error) {
        console.error("Error checking auth status:", error)
        // Even if API call fails, try to use saved user data
        const savedUserData = JSON.parse(savedUser);
        setUser(savedUserData);
        setProfile(savedUserData);
      }
    }
    setIsCheckingAuth(false);
  }, [])

  // Component-specific logout function
  const handleComponentLogout = () => {
    handleLogout();
    setUser(null);
    setProfile(null);
  }

  // Periodic token check (every hour)
  useEffect(() => {
    const interval = setInterval(() => {
      const token = localStorage.getItem("jwt_token");
      if (token && isTokenExpiredOrExpiring(token)) {
        console.log("Periodic token check: token needs refresh");
        refreshToken().catch(error => {
          console.error("Periodic token refresh failed:", error);
        });
      }
    }, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  // Global fetch interceptor for all API calls except auth
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async function (...args) {
      const [url, options = {}] = args;

      // Only intercept calls to our API that are NOT auth endpoints
      if (typeof url === "string" && 
          url.includes(API_BASE_URL) && 
          !url.includes('/api/auth/')) {
        return authFetch(url, options);
      }

      // For all other calls (including auth endpoints), use original fetch
      return originalFetch(url, options);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // Load auth status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" disabled>
          Загрузка...
        </Button>
      </div>
    );
  }

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
            <DropdownMenuItem onClick={handleComponentLogout}>
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
                <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      setIsLoading(true)
      const idToken = credentialResponse?.credential
      if (!idToken) {
        throw new Error("No credential returned from Google")
      }

      await authenticateWithBackend(idToken)
      setIsLoginDialogOpen(false)
      
      // Перезагрузка страницы после успешного входа
      window.location.reload()
    } catch (err) {
      console.error("Authentication error:", err)
      alert(`Ошибка при входе: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }}
  onError={() => {
    alert("Ошибка при входе через Google. Проверьте консоль для деталей.")
  }}
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

// Enhanced auth hook
export function useAuth() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("jwt_token")
      const savedUser = localStorage.getItem("user_data")

      if (token && savedUser) {
        // Check if token is valid
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000;
          if (Date.now() < exp) {
            setUser(JSON.parse(savedUser))
          } else {
            // Token expired, try to refresh
            try {
              await refreshToken();
              const refreshedUser = localStorage.getItem("user_data");
              if (refreshedUser) {
                setUser(JSON.parse(refreshedUser));
              }
            } catch (error) {
              console.error("Token refresh failed in useAuth:", error);
              // Clear invalid data
              localStorage.removeItem("jwt_token")
              localStorage.removeItem("user_data")
            }
          }
        } catch {
          // Invalid token, clear storage
          localStorage.removeItem("jwt_token")
          localStorage.removeItem("user_data")
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const isAuthenticated = !!user
  const getToken = () => {
    const token = localStorage.getItem("jwt_token");
    if (token && !isTokenExpiredOrExpiring(token)) {
      return token;
    }
    return null;
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    getToken,
  }
}

// Export authFetch for use in other components
export { authFetch };