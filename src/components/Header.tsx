"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "./ui/button"

interface HeaderProps {
  onNavigate: (page: "home" | "dashboard") => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function Header({ onNavigate, isDarkMode, onToggleDarkMode }: HeaderProps) {
  const handleNavigation = (page: "home" | "dashboard") => {
    onNavigate(page)
  }

  const headerClass = isDarkMode ? "bg-gray-900 shadow-sm border-b border-gray-700" : "bg-white shadow-sm border-b"

  const textClass = isDarkMode ? "text-gray-100" : "text-gray-900"
  const linkClass = isDarkMode ? "text-gray-300 hover:text-blue-400" : "text-gray-600 hover:text-blue-600"

  return (
    <header className={headerClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => handleNavigation("home")} className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className={`text-xl font-bold ${textClass}`}>HidroUEL</span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button onClick={() => handleNavigation("home")} className={`${linkClass} font-medium transition-colors`}>
              A Plataforma
            </button>
            <button className={`${linkClass} font-medium transition-colors`}>Como Funciona?</button>
            <button className={`${linkClass} font-medium transition-colors`}>Soluções</button>
            <button
              onClick={() => handleNavigation("dashboard")}
              className={`${linkClass} font-medium transition-colors flex items-center`}
            >
              Dashboard
            </button>
            <button className={`${linkClass} font-medium transition-colors`}>Sobre Nós</button>
          </nav>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleDarkMode}
              className={`border-2 transition-colors ${
                isDarkMode
                  ? "border-gray-600 hover:border-blue-400 bg-gray-800 text-gray-200"
                  : "border-gray-300 hover:border-blue-300"
              }`}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
              <span className="mr-2">👤</span>
              Fazer Login
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
