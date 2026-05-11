import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, Timestamp, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { db, auth } from '../lib/firebase/client'
import { 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  Activity, 
  ClipboardCheck,
  TrendingUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [role, setRole] = useState<string | null>(null)
  const [todaySession, setTodaySession] = useState<any>(null)
  const [pendingPSR, setPendingPSR] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRole = async () => {
      const user = auth.currentUser
      if (user) {
        const userSnap = await getDoc(doc(db, 'users', user.uid))
        if (userSnap.exists()) {
          setRole(userSnap.data().role)
        }
      }
    }
    fetchRole()
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setTodaySession({
      title: 'Treino Tático - Fase Ofensiva',
      time: '18:30',
      location: 'Campo Principal',
      type: 'treino'
    })
    setPendingPSR(14)
    setLoading(false)
  }

  if (loading) return <div className="p-12 text-center text-zinc-500 italic">A carregar o teu centro de comando...</div>
  if (role === 'jogador') return <PlayerDashboard todaySession={todaySession} />
  return <StaffDashboard todaySession={todaySession} pendingPSR={pendingPSR} role={role} />
}

function StaffDashboard({ todaySession, pendingPSR, role }: any) {
  const isAdmin = role === 'admin_clube'
  
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white italic">
          Olá, {isAdmin ? 'Administrador' : 'Treinador'}
        </h1>
        <p className="text-zinc-400 font-medium">
          {isAdmin ? 'Resumo global do clube para hoje.' : 'Gestão da equipa para hoje.'}
        </p>
      </div>

      {/* Grid de KPIs Escuros Premium */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Presenças Hoje" value="95%" icon={<ClipboardCheck className="text-blue-400" />} gradient="from-blue-500/20 to-transparent" border="border-blue-500/20" />
        <KPICard title="PSR Pendentes" value={pendingPSR} icon={<Clock className="text-amber-400" />} gradient="from-amber-500/20 to-transparent" border="border-amber-500/20" />
        <KPICard title="Alertas Médicos" value="3" icon={<AlertCircle className="text-rose-400" />} gradient="from-rose-500/20 to-transparent" border="border-rose-500/20" />
        <KPICard title="Performance" value="8.4" icon={<Activity className="text-emerald-400" />} gradient="from-emerald-500/20 to-transparent" border="border-emerald-500/20" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Próxima Sessão */}
        <div className="lg:col-span-2 p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] space-y-8 shadow-2xl shadow-black/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Calendar size={120} />
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Calendar size={24} className="text-blue-500" /> Próxima Atividade
            </h3>
            <span className="px-4 py-1.5 bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-500/20">
              Treino
            </span>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-3xl group-hover:border-white/10 transition-colors">
            <div className="space-y-2">
              <div className="text-2xl font-black text-white leading-tight">{todaySession?.title}</div>
              <p className="text-zinc-400 font-bold flex items-center gap-3">
                <Clock size={18} className="text-zinc-500" /> {todaySession?.time} · {todaySession?.location}
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-white/10">
              Abrir Sessão <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Alertas */}
        <div className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] space-y-8 shadow-2xl shadow-black/20 relative overflow-hidden">
          <h3 className="text-xl font-black text-white flex items-center gap-3 relative z-10">
            <AlertCircle size={24} className="text-rose-500" /> Alertas Staff
          </h3>
          <div className="space-y-4 relative z-10">
            <AlertItem name="Ricardo Gomes" issue="Dores no joelho esquerdo" status="Condicionado" />
            <AlertItem name="Miguel Santos" issue="Entorse tornozelo" status="Indisponível" />
            <AlertItem name="João Pedro" issue="Cansaço Acumulado" status="Atenção" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerDashboard({ todaySession }: any) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-5xl font-black text-white italic tracking-tighter drop-shadow-md">Olá, Atleta</h1>
        <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">O teu plano para hoje.</p>
      </div>

      <div className="p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl shadow-black/20 space-y-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <CheckCircle2 size={120} />
        </div>
        <h2 className="text-2xl font-black flex items-center gap-3 text-white relative z-10">
          <CheckCircle2 size={32} className="text-blue-500" /> Checklist Diário
        </h2>
        
        <div className="space-y-4 relative z-10">
          <PlayerCheckItem label="Responder Questionário PSR" done={false} />
          <PlayerCheckItem label="Confirmar Presença no Treino" done={true} />
          <PlayerCheckItem label="Visualizar clips da sessão anterior" done={false} />
        </div>
      </div>

      <div className="p-10 bg-zinc-950/50 backdrop-blur-md border border-white/5 rounded-[40px] shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-transparent opacity-50 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <h3 className="text-xl font-black text-white">Atividade de Hoje</h3>
          <span className="px-4 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase rounded-full backdrop-blur-sm">
            {todaySession?.time}
          </span>
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <div className="font-black text-white text-3xl leading-none tracking-tight">{todaySession?.title}</div>
            <p className="text-lg font-bold text-zinc-400">{todaySession?.location}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon, gradient, border }: any) {
  return (
    <div className={`p-8 bg-zinc-950/50 backdrop-blur-md border ${border || 'border-white/5'} rounded-[32px] hover:border-white/20 transition-all group relative overflow-hidden`}>
      {gradient && (
        <div className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none`}></div>
      )}
      <div className="relative z-10 flex items-center justify-between">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="group-hover:scale-110 transition-transform bg-white/5 p-3 rounded-2xl border border-white/5">
          {icon}
        </div>
      </div>
      <div className="relative z-10 mt-6">
        <div className="text-4xl font-black text-white tracking-tight drop-shadow-sm">{value}</div>
      </div>
    </div>
  )
}

function AlertItem({ name, issue, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-950/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/20 transition-all group shadow-sm">
      <div>
        <div className="text-sm font-black text-white group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[10px] text-zinc-500 uppercase tracking-tighter font-bold">{issue}</div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-inner ${
        status === 'Condicionado' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
        status === 'Indisponível' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
      }`}>
        {status}
      </span>
    </div>
  )
}

function PlayerCheckItem({ label, done }: any) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl transition-all shadow-sm ${
      done ? 'bg-zinc-900/50 opacity-60 border border-white/5' : 'bg-zinc-900 border border-white/10 hover:border-blue-500/50 text-white group cursor-pointer'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
          done ? 'bg-zinc-800 border-zinc-700 text-zinc-500' : 'border-zinc-600 group-hover:border-blue-500'
        }`}>
          {done && <CheckCircle2 size={18} />}
        </div>
        <span className={`text-lg font-black ${done ? 'line-through text-zinc-500' : 'group-hover:text-blue-400'}`}>{label}</span>
      </div>
      {!done && <ChevronRight size={24} className="text-zinc-600 group-hover:text-blue-500 transition-colors" />}
    </div>
  )
}
