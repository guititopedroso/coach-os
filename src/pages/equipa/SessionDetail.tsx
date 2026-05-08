import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { ArrowLeft, Save, Users, Video, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<any>(null)
  const [players, setPlayers] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    if (!id) return
    const sSnap = await getDoc(doc(db, 'events', id))
    if (sSnap.exists()) {
      const data = sSnap.data()
      setSession(data)
      setAttendance(data.attendance || {})
    }

    const pSnap = await getDocs(query(collection(db, 'players'), orderBy('number', 'asc')))
    setPlayers(pSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const markAttendance = (playerId: string, status: 'presente' | 'ausente' | 'lesionado') => {
    setAttendance({ ...attendance, [playerId]: status })
  }

  const handleSave = async () => {
    if (!id) return
    await updateDoc(doc(db, 'events', id), {
      attendance,
      updatedAt: new Date()
    })
    navigate('/equipa/planeamento')
  }

  if (loading) return <div className="p-12 text-center text-zinc-500">A carregar detalhes da sessão...</div>

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all font-bold text-sm">
          <ArrowLeft size={16} /> Voltar ao Planeamento
        </button>
        <button onClick={handleSave} className="px-6 py-2 bg-white text-black font-bold rounded-xl flex items-center gap-2 hover:bg-zinc-200 transition-all">
          <Save size={18} /> Guardar Alterações
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white">{session?.title}</h1>
          <p className="text-zinc-500 font-medium">
            {session?.date?.toDate().toLocaleDateString('pt', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {session?.type}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Lado Esquerdo: Plano e Notas */}
        <div className="lg:col-span-2 space-y-6">
          <section className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText size={20} className="text-zinc-500" /> Plano da Sessão
            </h3>
            <textarea 
              placeholder="Descreve os objetivos e exercícios aqui..."
              className="w-full min-h-[200px] bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 text-zinc-300 focus:ring-2 focus:ring-white outline-none transition-all"
            />
          </section>

          <section className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Video size={20} className="text-zinc-500" /> Clips e Referências
            </h3>
            <div className="p-4 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500 text-sm italic">
              Adiciona links de vídeo ou ficheiros aqui.
            </div>
          </section>
        </div>

        {/* Lado Direito: Presenças */}
        <div className="space-y-6">
          <section className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users size={20} className="text-zinc-500" /> Presenças
            </h3>
            
            <div className="space-y-3">
              {players.map(player => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 w-4">{player.number}</span>
                    <span className="text-sm font-bold text-white truncate w-24">{player.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <AttendanceBtn 
                      active={attendance[player.id] === 'presente'} 
                      onClick={() => markAttendance(player.id, 'presente')}
                      icon={<CheckCircle2 size={16} />}
                      color="text-green-500"
                    />
                    <AttendanceBtn 
                      active={attendance[player.id] === 'ausente'} 
                      onClick={() => markAttendance(player.id, 'ausente')}
                      icon={<XCircle size={16} />}
                      color="text-red-500"
                    />
                    <AttendanceBtn 
                      active={attendance[player.id] === 'lesionado'} 
                      onClick={() => markAttendance(player.id, 'lesionado')}
                      icon={<AlertCircle size={16} />}
                      color="text-yellow-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function AttendanceBtn({ active, onClick, icon, color }: any) {
  return (
    <button 
      onClick={onClick}
      className={`p-2 rounded-lg transition-all ${
        active ? `bg-white ${color}` : 'bg-zinc-800 text-zinc-600 hover:text-zinc-400'
      }`}
    >
      {icon}
    </button>
  )
}
