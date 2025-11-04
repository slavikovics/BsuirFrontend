// App.jsx
import { Header } from "./components/ui/header"
import { Schedule } from './components/ui/schedule/index'
import { KnowledgeSection } from './components/ui/knowledge'
import { InfoSection } from './components/ui/info'
import { useState } from "react"

function App() {
  const [activeTab, setActiveTab] = useState("schedule");

  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return <Schedule />;
      case "knowledge":
        return <KnowledgeSection />;
      case "info":
        return <InfoSection />;
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