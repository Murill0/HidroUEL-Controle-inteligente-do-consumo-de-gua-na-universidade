"use client"

import Header from "../components/Header"
import { Button } from "../components/ui/button"
import { ArrowRight, BarChart3, Shield, Zap, MessageCircle } from "lucide-react"

interface HomePageProps {
  onNavigate: (page: "home" | "dashboard") => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
}

export default function HomePage({ onNavigate, isDarkMode, onToggleDarkMode }: HomePageProps) {
  const handleNavigation = (page: "home" | "dashboard") => {
    onNavigate(page)
  }

  const backgroundClass = isDarkMode ? "min-h-screen bg-gray-900" : "min-h-screen bg-white"

  const heroBackgroundClass = isDarkMode
    ? "relative overflow-hidden bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800"
    : "relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50"

  const textClass = isDarkMode ? "text-gray-100" : "text-gray-900"
  const subtextClass = isDarkMode ? "text-gray-300" : "text-gray-600"

  return (
    <div className={backgroundClass}>
      <Header onNavigate={onNavigate} isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
      <section className={heroBackgroundClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className={`text-4xl lg:text-6xl font-bold ${textClass} leading-tight`}>
                  Gestão de{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    consumo de água
                  </span>{" "}
                  da UEL!
                </h1>
                <p className={`text-lg lg:text-xl ${subtextClass} leading-relaxed max-w-2xl`}>
                Plataforma da Universidade Estadual de Londrina para monitorar o consumo de água em tempo real, com notificações sobre desperdícios e vazamentos acessíveis em qualquer dispositivo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => handleNavigation("dashboard")}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  CONHEÇA A PLATAFORMA
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className={`border-2 px-8 py-3 text-lg font-semibold rounded-lg transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  }`}
                >
                  Saiba Mais
                </Button>
              </div>
              <div className="grid sm:grid-cols-3 gap-6 pt-8">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? "bg-blue-900" : "bg-blue-100"
                    }`}
                  >
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textClass}`}>Monitoramento</h3>
                    <p className={`text-sm ${subtextClass}`}>Tempo real</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? "bg-green-900" : "bg-green-100"
                    }`}
                  >
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textClass}`}>Alertas</h3>
                    <p className={`text-sm ${subtextClass}`}>Vazamentos</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isDarkMode ? "bg-purple-900" : "bg-purple-100"
                    }`}
                  >
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className={`font-semibold ${textClass}`}>Economia</h3>
                    <p className={`text-sm ${subtextClass}`}>Inteligente</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10">
                <img
                  src="../../public/uel-vertical-abreviada-cor.png"
                  alt="Dashboard de gestão de água"
                  className="w-100 h-auto "
                />
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
              <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            </div>
          </div>
        </div>
      </section>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="bg-green-500 hover:bg-green-600 text-white rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all animate-bounce"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
