"use client"

import { useState, useMemo, useRef } from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import {
  TrendingUp,
  Database,
  Search,
  FileText,
  ArrowUpDown,
  Activity,
  Zap,
  Download,
  BarChart3,
  TrendingDown,
  Building,
} from "lucide-react"
import useDados, { type DatasetType } from "../lib/useDados"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
} from "recharts"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]

interface TabelaConsumoProps {
  isDarkMode: boolean
}

export default function TabelaConsumo({ isDarkMode }: TabelaConsumoProps) {
  const [selectedDataset, setSelectedDataset] = useState<DatasetType>("geral")
  const { dados, loading, dataset } = useDados(selectedDataset)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [searchText, setSearchText] = useState("")
  const [chartType, setChartType] = useState<
    "line" | "bar" | "pie" | "area" | "radar" | "scatter" | "treemap" | "sector-comparison" | "heatmap"
  >("line")
  const chartRef = useRef<HTMLDivElement>(null)

  const datasets = [
    { id: "geral" as DatasetType, name: "Consumo Geral" },
    { id: "setores" as DatasetType, name: "Consumo por Setores" },
    { id: "mensal" as DatasetType, name: "Consumo Mensal" },
  ]

  const availableYears = useMemo(() => {
    if (!dados || dados.length === 0) return []
    const years = new Set<number>()
    dados.forEach((item) => {
      if (item && typeof item.ano === "number" && item.ano > 2000 && item.ano < 2030) {
        years.add(item.ano)
      }
    })
    return Array.from(years).sort((a, b) => a - b)
  }, [dados])

  const filteredData = useMemo(() => {
    if (!dados || dados.length === 0) return []

    return dados.filter((item) => {
      if (!item || typeof item.ano !== "number" || typeof item.mes !== "number") return false
      if (item.ano < 2000 || item.ano > 2030 || item.mes < 1 || item.mes > 12) return false

      // Year filter
      if (selectedYear !== "all" && item.ano.toString() !== selectedYear) {
        return false
      }

      // Search text filter
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const searchableText = [
          item.ano?.toString(),
          item.mes?.toString(),
          item.setor?.toString(),
          `${item.mes?.toString().padStart(2, "0")}/${item.ano}`,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()

        if (!searchableText.includes(searchLower)) return false
      }

      return true
    })
  }, [dados, selectedYear, searchText])

  const analytics = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null

    const totalConsumo = filteredData.reduce((acc, item) => {
      const consumo = Number(item.consumo_m3) || 0
      return acc + consumo
    }, 0)

    const avgConsumo = totalConsumo / filteredData.length

    const totalCusto = filteredData.reduce((acc, item) => {
      const custo = Number(item.custo_R$) || 0
      return acc + custo
    }, 0)

    return {
      totalConsumo,
      avgConsumo,
      totalCusto,
      recordCount: filteredData.length,
    }
  }, [filteredData])

  const sectorAnalytics = useMemo(() => {
    if (selectedDataset !== "setores" || !filteredData.length) return null

    const sectorData = filteredData.reduce(
      (acc, item) => {
        const setor = item.setor || "Não informado"
        const consumo = Number(item.consumo_m3) || 0
        acc[setor] = (acc[setor] || 0) + consumo
        return acc
      },
      {} as Record<string, number>,
    )

    const sortedSetores = Object.entries(sectorData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const totalConsumo = Object.values(sectorData).reduce((sum, val) => sum + val, 0)
    const maiorSetor = sortedSetores[0]
    const menorSetor = sortedSetores[sortedSetores.length - 1]

    return {
      totalSetores: Object.keys(sectorData).length,
      maiorSetor: maiorSetor ? { nome: maiorSetor[0], consumo: maiorSetor[1] } : null,
      menorSetor: menorSetor ? { nome: menorSetor[0], consumo: menorSetor[1] } : null,
      topSetores: sortedSetores,
      totalConsumo,
    }
  }, [filteredData, selectedDataset])

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return []

    if (chartType === "pie") {
      const yearData = filteredData.reduce(
        (acc, item) => {
          const ano = item.ano?.toString() || "Não informado"
          const consumo = Number(item.consumo_m3) || 0
          acc[ano] = (acc[ano] || 0) + consumo
          return acc
        },
        {} as Record<string, number>,
      )

      return Object.entries(yearData)
        .filter(([_, value]) => value > 0)
        .map(([name, value], index) => ({
          name,
          value,
          fill: COLORS[index % COLORS.length],
        }))
    }

    return filteredData
      .filter((item) => {
        const consumo = Number(item.consumo_m3)
        return !isNaN(consumo) && consumo > 0
      })
      .map((item) => ({
        data: `${item.mes?.toString().padStart(2, "0")}/${item.ano}`,
        consumo: Number(item.consumo_m3) || 0,
        custo: Number(item["custo_R$"]) || 0,
        chuva: Number(item.chuva_mm) || 0,
        usuarios: Number(item.usuarios_no_campus) || 0,
      }))
  }, [filteredData, chartType])

  const downloadChartAsPNG = () => {
    if (!chartRef.current) return

    const svgElement = chartRef.current.querySelector("svg")
    if (!svgElement) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
    const svgUrl = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.fillStyle = isDarkMode ? "#1f2937" : "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `hidrouel-grafico-${chartType}-${new Date().toISOString().split("T")[0]}.png`
          a.click()
          URL.revokeObjectURL(url)
        }
      })
      URL.revokeObjectURL(svgUrl)
    }
    img.src = svgUrl
  }

  const exportToCSV = () => {
    if (!filteredData || filteredData.length === 0) return

    let headers: string[]
    if (selectedDataset === "setores") {
      headers = ["Data", "Setor", "Consumo (m³)"]
    } else {
      headers = ["Data", "Consumo (m³)", "Custo (R$)", "Chuva (mm)", "Usuários"]
    }

    const rows = filteredData
      .map((row) => {
        const data = `${row.mes?.toString().padStart(2, "0")}/${row.ano}`
        if (selectedDataset === "setores") {
          return [data, row.setor || "N/A", Number(row.consumo_m3) || 0].join(",")
        } else {
          return [
            data,
            Number(row.consumo_m3) || 0,
            Number(row.custo_R$) || 0,
            Number(row.chuva_mm) || 0,
            Number(row.usuarios_no_campus) || 0,
          ].join(",")
        }
      })
      .join("\n")

    const csv = `${headers.join(",")}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `hidrouel-${selectedDataset}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const renderChart = () => {
    if (chartData.length === 0) return null

    const commonProps = {
      width: "100%",
      height: 400,
    }

    const tooltipStyle = {
      backgroundColor: isDarkMode ? "#1f2937" : "white",
      border: "none",
      borderRadius: "12px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      color: isDarkMode ? "white" : "black",
    }

    switch (chartType) {
      case "pie":
        return (
          <ResponsiveContainer {...commonProps}>
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`pieGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={entry.fill} />
                    <stop offset="100%" stopColor={entry.fill} stopOpacity={0.8} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={40}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#pieGradient-${index})`} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )

      case "radar":
        return (
          <ResponsiveContainer {...commonProps}>
            <RadarChart data={chartData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
              <PolarGrid stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
              <PolarAngleAxis dataKey="month" tick={{ fill: isDarkMode ? "#9ca3af" : "#64748b", fontSize: 12 }} />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "dataMax"]}
                tick={{ fill: isDarkMode ? "#9ca3af" : "#64748b", fontSize: 10 }}
              />
              <Radar
                name="Consumo"
                dataKey="consumo"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar name="Custo" dataKey="custo" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Chuva" dataKey="chuva" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer {...commonProps}>
            <ScatterChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
              <XAxis dataKey="chuva" name="Chuva (mm)" stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <YAxis dataKey="consumo" name="Consumo (m³)" stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: any, name: any) => [
                  name === "consumo" ? `${Number(value).toLocaleString("pt-BR")} m³` : `${value} mm`,
                  name === "consumo" ? "Consumo" : "Chuva",
                ]}
              />
              <Scatter dataKey="consumo" fill="#3b82f6" fillOpacity={0.7} r={6} />
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="consumoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="custoGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
              <XAxis dataKey="data" stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <YAxis stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="consumo"
                stackId="1"
                stroke="#3b82f6"
                fill="url(#consumoGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="custo"
                stackId="2"
                stroke="#10b981"
                fill="url(#custoGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "#374151" : "#e2e8f0"} />
              <XAxis dataKey="data" stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <YAxis stroke={isDarkMode ? "#9ca3af" : "#64748b"} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="consumo"
                stroke="url(#lineGradient)"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
    }
  }

  const columns: ColumnDef<any>[] = useMemo(() => {
    const baseColumns = [
      {
        accessorKey: "data",
        header: ({ column }: any) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold hover:bg-transparent"
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }: any) => {
          const data = row.original
          const mes = data.mes?.toString().padStart(2, "0") || "00"
          const ano = data.ano || "0000"
          return `${mes}/${ano}`
        },
      },
    ]

    if (selectedDataset === "setores") {
      return [
        ...baseColumns,
        {
          accessorKey: "setor",
          header: "Setor",
          cell: ({ row }: any) => row.getValue("setor") || "N/A",
        },
        {
          accessorKey: "consumo_m3",
          header: "Consumo (m³)",
          cell: ({ row }: any) => {
            const value = Number(row.getValue("consumo_m3")) || 0
            return value.toLocaleString("pt-BR")
          },
        },
      ]
    }

    return [
      ...baseColumns,
      {
        accessorKey: "consumo_m3",
        header: "Consumo (m³)",
        cell: ({ row }: any) => {
          const value = Number(row.getValue("consumo_m3")) || 0
          return value.toLocaleString("pt-BR")
        },
      },
      {
        accessorKey: "custo_R$",
        header: "Custo (R$)",
        cell: ({ row }: any) => {
          const value = Number(row.getValue("custo_R$")) || 0
          return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        },
      },
      {
        accessorKey: "chuva_mm",
        header: "Chuva (mm)",
        cell: ({ row }: any) => {
          const value = Number(row.getValue("chuva_mm")) || 0
          return `${value} mm`
        },
      },
      {
        accessorKey: "usuarios_no_campus",
        header: "Usuários",
        cell: ({ row }: any) => {
          const value = Number(row.getValue("usuarios_no_campus")) || 0
          return value.toLocaleString("pt-BR")
        },
      },
    ]
  }, [selectedDataset])

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const containerClass = isDarkMode
    ? "min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white"
    : "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100"

  const cardClass = isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"

  return (
    <div className={`${containerClass} p-4 md:p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`${cardClass} rounded-xl p-6 shadow-sm border space-y-4`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HidroUEL Dashboard
              </h1>
              <p className={`${isDarkMode ? "text-gray-300" : "text-muted-foreground"} mt-1`}>{dataset.name}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedDataset} onValueChange={(value: DatasetType) => setSelectedDataset(value)}>
                <SelectTrigger className="w-[200px]">
                  <Database className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={exportToCSV}
                className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white" : ""}
              >
                <FileText className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por mês/ano..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os anos</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && (
          <>
            {analytics && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm font-medium">Consumo Total</p>
                        <p className="text-2xl font-bold">{analytics.totalConsumo.toLocaleString("pt-BR")} m³</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm font-medium">Média</p>
                        <p className="text-2xl font-bold">
                          {Math.round(analytics.avgConsumo).toLocaleString("pt-BR")} m³
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm font-medium">Custo Total</p>
                        <p className="text-2xl font-bold">
                          R$ {analytics.totalCusto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Zap className="h-8 w-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100 text-sm font-medium">Registros</p>
                        <p className="text-2xl font-bold">{analytics.recordCount.toLocaleString("pt-BR")}</p>
                      </div>
                      <Database className="h-8 w-8 text-orange-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {sectorAnalytics && (
              <Card className={`shadow-lg border-0 ${cardClass}`}>
                <CardHeader>
                  <CardTitle className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    📊 Análise por Setores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-blue-50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Total de Setores
                          </p>
                          <p className="text-2xl font-bold text-blue-600">{sectorAnalytics.totalSetores}</p>
                        </div>
                        <Building className="h-8 w-8 text-blue-500" />
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-green-50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Maior Consumidor
                          </p>
                          <p className="text-lg font-semibold text-green-600 truncate">
                            {sectorAnalytics.maiorSetor?.nome || "N/A"}
                          </p>
                          <p className="text-sm text-green-500">
                            {sectorAnalytics.maiorSetor?.consumo.toLocaleString("pt-BR")} m³
                          </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-green-500" />
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-orange-50"}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                            Menor Consumidor
                          </p>
                          <p className="text-lg font-semibold text-orange-600 truncate">
                            {sectorAnalytics.menorSetor?.nome || "N/A"}
                          </p>
                          <p className="text-sm text-orange-500">
                            {sectorAnalytics.menorSetor?.consumo.toLocaleString("pt-BR")} m³
                          </p>
                        </div>
                        <TrendingDown className="h-8 w-8 text-orange-500" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      🏆 Top 5 Setores por Consumo
                    </h4>
                    <div className="space-y-3">
                      {sectorAnalytics.topSetores.map(([setor, consumo], index) => {
                        const percentage = (consumo / sectorAnalytics.totalConsumo) * 100
                        return (
                          <div key={setor} className="flex items-center gap-4">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0
                                  ? "bg-yellow-500 text-white"
                                  : index === 1
                                    ? "bg-gray-400 text-white"
                                    : index === 2
                                      ? "bg-orange-500 text-white"
                                      : isDarkMode
                                        ? "bg-gray-600 text-gray-300"
                                        : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span
                                  className={`font-medium truncate ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
                                >
                                  {setor}
                                </span>
                                <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {consumo.toLocaleString("pt-BR")} m³ ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className={`w-full h-2 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-gray-200"}`}>
                                <div
                                  className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {chartData.length > 0 && (
              <Card className={`shadow-lg border-0 ${cardClass}`}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      {chartType === "pie" && "Distribuição por Ano"}
                      {chartType === "radar" && "Análise Multidimensional"}
                      {chartType === "scatter" && "Correlação Chuva vs Consumo"}
                      {chartType === "area" && "Evolução Empilhada"}
                      {(chartType === "line" || chartType === "bar") && "Evolução do Consumo"}
                    </CardTitle>

                    <div className="flex gap-2">
                      <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
                        <SelectTrigger className="w-[180px]">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">📈 Linha</SelectItem>
                          <SelectItem value="bar">📊 Barras</SelectItem>
                          <SelectItem value="pie">🥧 Pizza</SelectItem>
                          {selectedDataset !== "setores" && (
                            <>
                              <SelectItem value="area">📈 Área</SelectItem>
                              <SelectItem value="radar">🎯 Radar</SelectItem>
                              <SelectItem value="scatter">💧 Chuva vs Consumo</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadChartAsPNG}
                        className={isDarkMode ? "border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white" : ""}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PNG
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div ref={chartRef} className="transition-all duration-700 ease-in-out transform">
                    {renderChart()}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className={`shadow-lg border-0 ${cardClass}`}>
              <CardHeader>
                <CardTitle className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                  Dados Detalhados ({filteredData.length} registros)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className={`${isDarkMode ? "bg-gray-700" : "bg-gray-50"} border-b`}>
                      {table.getHeaderGroups().map((hg) => (
                        <tr key={hg.id}>
                          {hg.headers.map((header) => (
                            <th
                              key={header.id}
                              className={`h-12 px-6 text-left align-middle font-semibold text-sm ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className={`border-b transition-colors ${
                            isDarkMode ? "hover:bg-gray-700 border-gray-600" : "hover:bg-blue-50/50 border-gray-200"
                          } ${
                            index % 2 === 0
                              ? isDarkMode
                                ? "bg-gray-800"
                                : "bg-white"
                              : isDarkMode
                                ? "bg-gray-750"
                                : "bg-gray-50/30"
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`p-6 align-middle text-sm ${isDarkMode ? "text-gray-200" : "text-gray-900"}`}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
