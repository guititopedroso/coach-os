import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, query, where, Timestamp, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { Calendar as CalendarIcon, List, BarChart3, Plus, ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

type ViewType = 'month' | 'week' | 'macro'

export default function Planning() {
  const [view, setView] = useState<ViewType>('month')
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const navigate = useNavigate()

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    setLoading(true)
    const q = query(collection(db, 'events'), orderBy('date', 'asc'))
    const snap = await getDocs(q)
    setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleAddEvent = async (type: string, date: Date) => {
    try {
      await addDoc(collection(db, 'events'), {
        type,
        title: type === 'treino' ? 'Treino' : type === 'jogo' ? 'Jogo' : 'Folga',
        date: Timestamp.fromDate(date),
        status: 'draft', // Rascunho por defeito
        clubId: 'default_club',
        teamId: 'default_team',
        createdAt: Timestamp.now()
      })
      fetchEvents()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header com Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Planeamento</h1>
          <p className="text-zinc-400 text-sm">Organiza a época da tua equipa.</p>
        </div>

        <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 self-start">
          <TabButton active={view === 'month'} onClick={() => setView('month')} icon={<CalendarIcon size={18} />} label="Mês" />
          <TabButton active={view === 'week'} onClick={() => setView('week')} icon={<List size={18} />} label="Semana" />
          <TabButton active={view === 'macro'} onClick={() => setView('macro')} icon={<BarChart3 size={18} />} label="Macrociclo" />
        </div>
      </div>

      {/* Conteúdo Dinâmico */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl min-h-[500px] overflow-hidden">
        {view === 'month' && <MonthlyView events={events} onAdd={handleAddEvent} currentDate={currentDate} setCurrentDate={setCurrentDate} navigate={navigate} />}
        {view === 'week' && <WeeklyView events={events} />}
        {view === 'macro' && <MacroView events={events} />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
        active ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function MonthlyView({ events, onAdd, currentDate, setCurrentDate, navigate }: any) {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  // Ajustar para Seg=0
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  
  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - startOffset + 1
    if (day > 0 && day <= daysInMonth) return day
    return null
  })

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <h2 className="text-xl font-bold capitalize">
          {currentDate.toLocaleString('pt', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-zinc-800 rounded-lg"><ChevronLeft /></button>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-zinc-800 rounded-lg"><ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-zinc-800 bg-zinc-900/30">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => (
          <div key={d} className="p-4 text-center text-xs font-bold text-zinc-500 uppercase tracking-widest">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1">
        {days.map((d, i) => {
          const dateStr = d ? new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toDateString() : ''
          const dayEvents = events.filter((e: any) => e.date.toDate().toDateString() === dateStr)
          
          return (
            <div key={i} className={`min-h-[120px] p-2 border-r border-b border-zinc-800 hover:bg-zinc-800/10 transition-all relative group ${!d && 'bg-zinc-950/50'}`}>
              {d && (
                <>
                  <span className="text-sm font-medium text-zinc-500 ml-1">{d}</span>
                  <div className="mt-2 space-y-1">
                    {dayEvents.map((e: any) => (
                      <div 
                        key={e.id} 
                        onClick={() => navigate(`/equipa/sessao/${e.id}`)}
                        className={`text-[10px] p-1.5 rounded-md font-bold uppercase truncate flex items-center justify-between cursor-pointer hover:scale-105 transition-all ${
                        e.type === 'treino' ? 'bg-blue-500/10 text-blue-400' : 
                        e.type === 'jogo' ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {e.title}
                        {e.status === 'draft' ? <EyeOff size={10} /> : <Eye size={10} />}
                      </div>
                    ))}
                  </div>
                  
                  {/* Botão rápido para adicionar */}
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                    <button onClick={() => onAdd('treino', new Date(currentDate.getFullYear(), currentDate.getMonth(), d!))} className="p-1 bg-zinc-800 hover:bg-white hover:text-black rounded text-[10px] font-bold">T</button>
                    <button onClick={() => onAdd('jogo', new Date(currentDate.getFullYear(), currentDate.getMonth(), d!))} className="p-1 bg-zinc-800 hover:bg-white hover:text-black rounded text-[10px] font-bold">J</button>
                    <button onClick={() => onAdd('folga', new Date(currentDate.getFullYear(), currentDate.getMonth(), d!))} className="p-1 bg-zinc-800 hover:bg-white hover:text-black rounded text-[10px] font-bold">F</button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeeklyView({ events }: any) {
  return <div className="p-12 text-center text-zinc-500 italic">Vista Semanal Detalhada: Próxima etapa de implementação...</div>
}

function MacroView({ events }: any) {
  return <div className="p-12 text-center text-zinc-500 italic">Vista Macrociclo: Próxima etapa de implementação...</div>
}
