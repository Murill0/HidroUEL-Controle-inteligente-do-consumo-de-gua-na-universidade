"use client"

import { useState } from "react"
import HomePage from "./pages/HomePage"
import Dashboard from "./pages/Dashboard"
import "./App.css"

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "dashboard">("home")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const navigateTo = (page: "home" | "dashboard") => {
    setCurrentPage(page)
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="App">
      {currentPage === "home" && (
        <HomePage onNavigate={navigateTo} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      )}
      {currentPage === "dashboard" && (
        <Dashboard onNavigate={navigateTo} isDarkMode={isDarkMode} onToggleDarkMode={toggleDarkMode} />
      )}
    </div>
  )
}

export default App
