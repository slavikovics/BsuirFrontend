import { Header } from "./components/ui/header"
import { Schedule } from "./components/ui/schedule"

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Schedule />
    </div>
  )
}

export default App