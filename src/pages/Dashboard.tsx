import Header from "../components/Header"
import TabelaConsumo from "../components/TabelaConsumo"

interface DashboardProps {
  onNavigate: (page: "home" | "dashboard") => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function Dashboard({ onNavigate, isDarkMode, onToggleDarkMode }: DashboardProps) {
  const backgroundClass = isDarkMode ? "min-h-screen bg-gray-900" : "min-h-screen bg-gray-50"

  return (
    <div className={backgroundClass}>
      <Header onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <main>
        <TabelaConsumo isDarkMode={isDarkMode} />
      </main>
    </div>
  )
}
