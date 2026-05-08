import { useEffect, useState } from 'react'
import { collection, getDocs, query, where, Timestamp, orderBy, limit } from 'firebase/firestore'
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
  const [role, setRole] = useState<'admin_clube' | 'staff' | 'jogador'>('staff')
  const [todaySession, setTodaySession] = useState<any>(null)
  const [pendingPSR, setPendingPSR] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
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

  if (role === 'jogador') return <PlayerDashboard todaySession={todaySession} />
  return <StaffDashboard todaySession={todaySession} pendingPSR={pendingPSR} />
}

function StaffDashboard({ todaySession, pendingPSR }: any) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight text-white">Resumo Diário</h1>
        <p className="text-zinc-500 font-medium">Gestão da equipa para hoje, {new Date().toLocaleDateString('pt', { day: 'numeric', month: 'long' })}.</p>
      </div>

      {/* Grid de KPIs Escuros Premium */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Presenças Hoje" value="95%" icon={<ClipboardCheck className="text-blue-500" />} />
        <KPICard title="PSR Pendentes" value={pendingPSR} icon={<Clock className="text-amber-500" />} />
        <KPICard title="Alertas Médicos" value="3" icon={<AlertCircle className="text-rose-500" />} />
        <KPICard title="Performance" value="8.4" icon={<Activity className="text-emerald-500" />} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Próxima Sessão */}
        <div className="lg:col-span-2 p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white flex items-center gap-3">
              <Calendar size={24} className="text-zinc-500" /> Próxima Atividade
            </h3>
            <span className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full">
              Treino
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-zinc-950/50 border border-zinc-900 rounded-3xl">
            <div className="space-y-2">
              <div className="text-2xl font-black text-white leading-tight">{todaySession?.title}</div>
              <p className="text-zinc-500 font-bold flex items-center gap-3">
                <Clock size={18} className="text-zinc-700" /> {todaySession?.time} · {todaySession?.location}
              </p>
            </div>
            <button className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-2">
              Abrir Sessão <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Alertas */}
        <div className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <AlertCircle size={24} className="text-rose-500" /> Alertas Staff
          </h3>
          <div className="space-y-4">
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
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-4xl font-black text-white">Olá, Atleta</h1>
        <p className="text-zinc-500 font-medium italic">Plano para hoje.</p>
      </div>

      <div className="p-10 bg-white text-black rounded-[40px] shadow-2xl space-y-8">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <CheckCircle2 size={32} /> Checklist Diário
        </h2>
        
        <div className="space-y-4">
          <PlayerCheckItem label="Responder Questionário PSR" done={false} />
          <PlayerCheckItem label="Confirmar Presença no Treino" done={true} />
          <PlayerCheckItem label="Visualizar clips da sessão anterior" done={false} />
        </div>
      </div>

      <div className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-white">Atividade de Hoje</h3>
          <span className="px-4 py-1.5 bg-zinc-800 text-zinc-400 text-xs font-black uppercase rounded-full">
            {todaySession?.time}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center text-white">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <div className="font-black text-white text-2xl leading-none">{todaySession?.title}</div>
            <p className="text-lg font-bold text-zinc-600">{todaySession?.location}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, icon }: any) {
  return (
    <div className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-[32px] hover:border-zinc-700 transition-all group">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{title}</p>
        <div className="group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div className="mt-6">
        <div className="text-4xl font-black text-white tracking-tight">{value}</div>
      </div>
    </div>
  )
}

function AlertItem({ name, issue, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-900 hover:border-zinc-700 transition-all">
      <div>
        <div className="text-sm font-black text-white">{name}</div>
        <div className="text-[10px] text-zinc-600 uppercase tracking-tighter">{issue}</div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
        status === 'Condicionado' ? 'bg-amber-500/10 text-amber-500' : 
        status === 'Indisponível' ? 'bg-rose-500/10 text-rose-500' : 'bg-zinc-800 text-zinc-500'
      }`}>
        {status}
      </span>
    </div>
  )
}

function PlayerCheckItem({ label, done }: any) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl transition-all ${
      done ? 'bg-zinc-100 opacity-60' : 'bg-zinc-50 text-black'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
          done ? 'bg-black border-black text-white' : 'border-zinc-200'
        }`}>
          {done && <CheckCircle2 size={18} />}
        </div>
        <span className={`text-lg font-black ${done ? 'line-through text-zinc-400' : ''}`}>{label}</span>
      </div>
      {!done && <ChevronRight size={24} className="text-zinc-300" />}
    </div>
  )
}
