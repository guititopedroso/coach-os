import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { Users, Filter, ChevronRight, Activity, Award } from 'lucide-react'

const POSITIONS = [
  { id: 'GR', label: 'Guarda-Redes' },
  { id: 'Defesa', label: 'Defesas' },
  { id: 'Médio', label: 'Médios' },
  { id: 'Avançado', label: 'Avançados' }
]

export default function Squad() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    // Em produção: filter by teamId
    const q = query(collection(db, 'players'), orderBy('number', 'asc'))
    const snap = await getDocs(q)
    setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const filteredPlayers = selectedPosition 
    ? players.filter(p => p.position === selectedPosition)
    : players

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Plantel</h1>
          <p className="text-zinc-400 text-sm">Gestão técnica e física dos teus atletas.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => setSelectedPosition(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              !selectedPosition ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            Todos
          </button>
          {POSITIONS.map(pos => (
            <button 
              key={pos.id}
              onClick={() => setSelectedPosition(pos.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedPosition === pos.id ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              {pos.id}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-zinc-500 italic">A processar o plantel...</div>
      ) : (
        <div className="space-y-12">
          {POSITIONS.filter(pos => !selectedPosition || pos.id === selectedPosition).map(pos => {
            const posPlayers = players.filter(p => p.position === pos.id)
            if (posPlayers.length === 0 && selectedPosition) return <p key={pos.id} className="text-zinc-500 italic">Nenhum jogador registado nesta posição.</p>
            if (posPlayers.length === 0) return null

            return (
              <div key={pos.id} className="space-y-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">{pos.label}</h2>
                  <div className="h-px bg-zinc-800 flex-1"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posPlayers.map(player => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function PlayerCard({ player }: any) {
  return (
    <div className="group bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-600 transition-all space-y-6 relative overflow-hidden">
      {/* Indicador de Estado */}
      <div className={`absolute top-0 right-0 w-1.5 h-full ${
        player.status === 'lesionado' ? 'bg-red-500' : 
        player.status === 'condicionado' ? 'bg-yellow-500' : 'bg-green-500'
      }`}></div>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center font-bold text-xl text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
            {player.number || '?'}
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">{player.name}</h3>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{player.position}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
            <Activity size={12} /> Assiduidade
          </div>
          <div className="text-lg font-bold text-white">92%</div>
        </div>
        <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-2xl space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tight">
            <Award size={12} /> Avaliação
          </div>
          <div className="text-lg font-bold text-white">8.4</div>
        </div>
      </div>

      <button className="w-full py-3 px-4 bg-zinc-800 hover:bg-white hover:text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
        Ver Perfil Completo <ChevronRight size={14} />
      </button>
    </div>
  )
}
