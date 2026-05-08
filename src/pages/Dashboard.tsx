import { useEffect, useState } from 'react'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db, auth } from '../lib/firebase/client'

export default function Dashboard() {
  const [stats, setStats] = useState({ players: 0, teams: 0 })
  const user = auth.currentUser

  useEffect(() => {
    const fetchStats = async () => {
      // Simulação de dados reais do Firestore
      setStats({ players: 12, teams: 3 })
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">Olá, Treinador</h1>
        <p className="text-zinc-400">Aqui está o resumo do teu clube hoje.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card title="Total de Jogadores" value={stats.players} description="+2 desde a última semana" />
        <Card title="Equipas Ativas" value={stats.teams} description="Época 2023/24" />
        <Card title="Próximo Treino" value="18:30" description="Campo Principal" />
        <Card title="Presenças Hoje" value="95%" description="Média do clube" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
          <h3 className="text-xl font-semibold text-white">Atividades Recentes</h3>
          <p className="text-zinc-400 text-sm italic">Nenhuma atividade recente para mostrar.</p>
        </div>
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
          <h3 className="text-xl font-semibold text-white">Mensagens do Clube</h3>
          <p className="text-zinc-400 text-sm">Bem-vindo à nova versão do CoachOS (Vite Edition).</p>
        </div>
      </div>
    </div>
  )
}

function Card({ title, value, description }: any) {
  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-2 hover:border-zinc-700 transition-colors cursor-default">
      <p className="text-sm font-medium text-zinc-400">{title}</p>
      <div className="text-3xl font-bold text-white">{value}</div>
      <p className="text-xs text-zinc-500">{description}</p>
    </div>
  )
}
