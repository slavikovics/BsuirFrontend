import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Loader2 } from "lucide-react"

const API_BASE_URL = import.meta.env.VITE_APP_API_URL || "http://localhost:8081"

export function SettingsDialog({ open, onOpenChange, user, onUserUpdate }) {
  const [groupNumber, setGroupNumber] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState("")

  // Инициализируем поле группы при открытии диалога
  useEffect(() => {
    if (open && user) {
      setGroupNumber(user.groupNumber?.toString() || "")
    }
  }, [open, user])

  const handleSaveGroup = async () => {
    if (!user) return

    setIsLoading(true)
    setSaveStatus("")

    try {
      const token = localStorage.getItem("jwt_token")
      const groupValue = groupNumber.trim() === "" ? null : parseInt(groupNumber)

      // Валидация на фронтенде
      if (groupValue && (groupValue < 100000 || groupValue > 999999)) {
        setSaveStatus("error:Номер группы должен состоять из 6 цифр")
        return
      }

      const response = await fetch(`${API_BASE_URL}/api/users/me/group`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupNumber: groupValue }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update group")
      }

      const updatedUser = await response.json()
      onUserUpdate(updatedUser)
      setSaveStatus("success:Группа успешно обновлена!")
      
      // Автоматически закрываем сообщение через 2 секунды
      setTimeout(() => {
        setSaveStatus("")
        onOpenChange(false)
      }, 2000)

    } catch (error) {
      console.error("Error updating group:", error)
      setSaveStatus(`error:${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGroupInputChange = (e) => {
    const value = e.target.value.replace(/\D/g, "") // Только цифры
    if (value === "" || (value.length <= 6 && /^\d*$/.test(value))) {
      setGroupNumber(value)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Настройки профиля</DialogTitle>
          <DialogDescription>
            Управление настройками вашего аккаунта
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Учебная группа</CardTitle>
              <CardDescription>
                Укажите номер вашей учебной группы (6 цифр)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="groupNumber">Номер группы</Label>
                <Input
                  id="groupNumber"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="123456"
                  value={groupNumber}
                  onChange={handleGroupInputChange}
                  maxLength={6}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Оставьте поле пустым, чтобы удалить группу
                </p>
              </div>

              {saveStatus && (
                <div
                  className={`p-3 rounded-md text-sm ${
                    saveStatus.startsWith("success")
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {saveStatus.split(":")[1]}
                </div>
              )}

              <Button 
                onClick={handleSaveGroup} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Сохранение..." : "Сохранить группу"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Информация о пользователе</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Имя:</span>
                <span>{user?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span>{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Текущая группа:</span>
                <span>{user?.groupNumber || "Не указана"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}