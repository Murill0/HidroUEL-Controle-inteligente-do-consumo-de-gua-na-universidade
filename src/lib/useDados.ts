"use client"

import { useEffect, useState } from "react"
import Papa from "papaparse"

export interface Consumo {
  ano: number
  mes: number
  consumo_m3: number
  custo_R$: number
  chuva_mm: number
  usuarios_no_campus: number
}

export interface ConsumoSetor {
  ano: number
  mes: number
  setor: string
  consumo_m3: number
}

export interface ConsumoMensal {
  ano: number
  mes: number
  consumo_m3: number
  custo_R$: string
  chuva_mm: string
  usuarios_no_campus: number
}

export type DatasetType = "geral" | "setores" | "mensal"

export interface DatasetConfig {
  name: string
  url: string
  type: DatasetType
}

export const datasets: Record<DatasetType, DatasetConfig> = {
  geral: {
    name: "Consumo Geral",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/consumo_agua-83JvlpHFWhMgDGVHzRhRG2HZ50vJok.csv",
    type: "geral",
  },
  setores: {
    name: "Consumo por Setores",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/consumo_hidrometros_setores-QwXks3Cgo510I4ptktkUZz1JXpMFCf.csv",
    type: "setores",
  },
  mensal: {
    name: "Consumo Mensal",
    url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/consumo_agua_mensal-a12D9LIYaOHLYnGFdYBPEG7O0oXYc9.csv",
    type: "mensal",
  },
}

export default function useDados(datasetType: DatasetType = "geral") {
  const [dados, setDados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dataset = datasets[datasetType]
    setLoading(true)

    Papa.parse(dataset.url, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setDados(result.data as any[])
        setLoading(false)
      },
      error: () => {
        setLoading(false)
      },
    })
  }, [datasetType])

  return { dados, loading, dataset: datasets[datasetType] }
}
