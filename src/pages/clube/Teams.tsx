import { useState, useEffect } from 'react'
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { Users, Plus, Shield, ChevronRight } from 'lucide-react'

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newTeamName, setNewTeamName] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const sSnap = await getDocs(query(collection(db, 'seasons'), orderBy('createdAt', 'desc')))
    const sList = sSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setSeasons(sList)
    if (sList.length > 0) setSelectedSeason(sList[0].id)

    const tSnap = await getDocs(query(collection(db, 'teams'), orderBy('createdAt', 'desc')))
    setTeams(tSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName || !selectedSeason) return
    
    try {
      await addDoc(collection(db, 'teams'), {
        name: newTeamName,
        seasonId: selectedSeason,
        seasonName: seasons.find(s => s.id === selectedSeason)?.name,
        createdAt: Timestamp.now(),
        staff: []
      })
      setNewTeamName('')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <Users className="text-zinc-500" /> Equipas do Clube
        </h1>
        <p className="text-zinc-400">Gere as equipas e escalões ativos no clube.</p>
      </div>

      {/* Novo Equipamento */}
      <form onSubmit={handleAddTeam} className="grid grid-cols-1 md:flex gap-4 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        <input 
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="Nome da Equipa (ex: Sub-19 A)"
          className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-white transition-all outline-none"
        />
        <select 
          value={selectedSeason}
          onChange={(e) => setSelectedSeason(e.target.value)}
          className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:ring-2 focus:ring-white"
        >
          {seasons.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <button className="px-6 py-2 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all justify-center">
          <Plus size={20} /> Adicionar Equipa
        </button>
      </form>

      {/* Lista de Equipas */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-zinc-500 italic col-span-full text-center py-12">Carregando equipas...</p>
        ) : teams.length === 0 ? (
          <p className="text-zinc-500 italic col-span-full text-center py-12">Nenhuma equipa registada.</p>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="group relative p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl hover:border-zinc-600 transition-all space-y-4">
              <div className="flex items-start justify-between">
                <div className="p-3 bg-zinc-800 rounded-2xl text-zinc-400 group-hover:bg-white group-hover:text-black transition-all">
                  <Shield size={24} />
                </div>
                <div className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  {team.seasonName}
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white">{team.name}</h3>
                <p className="text-sm text-zinc-500">0 Atletas | 0 Staff</p>
              </div>

              <div className="pt-4 border-t border-zinc-800 flex justify-between items-center group-hover:border-zinc-700 transition-all">
                <span className="text-xs font-medium text-zinc-500">Ver detalhes</span>
                <ChevronRight size={16} className="text-zinc-600 group-hover:text-white transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
