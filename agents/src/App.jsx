// App.jsx
import { Header } from "./components/ui/header"
import { Schedule } from './components/ui/schedule/index'
import { FilesSection } from './components/ui/files/files-section'
import { InfoSection } from './components/ui/info'
import { TestPage } from './components/ui/test/index'
import { Chat } from './components/ui/chat/chat'
import { useState } from "react"

function App() {
  const [activeTab, setActiveTab] = useState("schedule");

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <Schedule />;
      case "files":
        return <FilesSection />;
      case "info":
        return <InfoSection />;
      case "chat":
        return <Chat />;
      case "test":
        return <TestPage />;
      default:
        return <Schedule />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </div>
  )
}

export default App