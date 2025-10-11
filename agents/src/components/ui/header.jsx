import { ThemeToggle } from "./theme-toggle"
import { AuthComponent } from "../auth-component"

export function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="text-xl font-bold">Интеллектуальный ассистент по университету</div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <AuthComponent />
        </div>
      </div>
    </header>
  )
}