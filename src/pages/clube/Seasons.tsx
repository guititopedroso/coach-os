import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, where, updateDoc, doc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { Trophy, Plus, Calendar, CheckCircle2, Circle } from 'lucide-react'

export default function Seasons() {
  const [seasons, setSeasons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSeasonName, setNewSeasonName] = useState('')

  useEffect(() => {
    fetchSeasons()
  }, [])

  const fetchSeasons = async () => {
    const q = query(collection(db, 'seasons'))
    const snap = await getDocs(q)
    setSeasons(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleAddSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSeasonName) return
    
    try {
      await addDoc(collection(db, 'seasons'), {
        name: newSeasonName,
        active: false,
        startDate: Timestamp.now(),
        endDate: Timestamp.now(),
        createdAt: Timestamp.now()
      })
      setNewSeasonName('')
      fetchSeasons()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    // Idealmente, apenas uma época pode estar ativa por clube
    // Por agora, vamos apenas alternar o estado
    await updateDoc(doc(db, 'seasons', id), {
      active: !currentStatus
    })
    fetchSeasons()
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Trophy className="text-zinc-500" /> Épocas Desportivas
        </h1>
        <p className="text-zinc-400">Gere os períodos de competição do teu clube.</p>
      </div>

      {/* Novo Plano */}
      <form onSubmit={handleAddSeason} className="flex gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        <input 
          type="text"
          value={newSeasonName}
          onChange={(e) => setNewSeasonName(e.target.value)}
          placeholder="Ex: 2023/24"
          className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-white transition-all outline-none"
        />
        <button className="px-6 py-2 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all">
          <Plus size={20} /> Criar Época
        </button>
      </form>

      {/* Lista de Épocas */}
      <div className="grid gap-4">
        {loading ? (
          <p className="text-zinc-500 italic">Carregando épocas...</p>
        ) : seasons.length === 0 ? (
          <p className="text-zinc-500 italic">Nenhuma época criada ainda.</p>
        ) : (
          seasons.map((season) => (
            <div key={season.id} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all group">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${season.active ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Calendar size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{season.name}</h3>
                  <p className="text-sm text-zinc-500">Criada em {season.createdAt?.toDate().toLocaleDateString()}</p>
                </div>
              </div>
              
              <button 
                onClick={() => toggleActive(season.id, season.active)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  season.active ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                }`}
              >
                {season.active ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                {season.active ? 'Ativa' : 'Ativar'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
