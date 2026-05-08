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
  TrendingUp,
  Users
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
        <h1 className="text-4xl font-black tracking-tight text-indigo-950">Resumo Diário</h1>
        <p className="text-zinc-500 font-medium">Gestão e monitorização da equipa para hoje, {new Date().toLocaleDateString('pt', { day: 'numeric', month: 'long' })}.</p>
      </div>

      {/* Grid de KPIs Premium */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Presenças Hoje" value="95%" sub="Previsão baseada no plantel" icon={<ClipboardCheck className="text-indigo-600" />} color="bg-indigo-50" />
        <KPICard title="PSR Pendentes" value={pendingPSR} sub="Aguardando resposta" icon={<Clock className="text-amber-500" />} color="bg-amber-50" />
        <KPICard title="Alertas Médicos" value="3" sub="Jogadores condicionados" icon={<AlertCircle className="text-rose-500" />} color="bg-rose-50" />
        <KPICard title="Disponibilidade" value="88%" sub="Média do plantel" icon={<Activity className="text-emerald-500" />} color="bg-emerald-50" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Próxima Sessão */}
        <div className="lg:col-span-2 p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-indigo-950 flex items-center gap-3">
              <Calendar size={24} className="text-indigo-900" /> Próxima Atividade
            </h3>
            <span className="px-4 py-1.5 bg-indigo-900 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
              Treino Principal
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 p-8 bg-zinc-50 border border-zinc-100 rounded-3xl">
            <div className="space-y-2">
              <div className="text-2xl font-black text-indigo-950 leading-tight">{todaySession?.title}</div>
              <p className="text-zinc-500 font-bold flex items-center gap-3">
                <Clock size={18} className="text-zinc-400" /> {todaySession?.time} · {todaySession?.location}
              </p>
            </div>
            <button className="px-8 py-4 bg-indigo-900 text-white font-black rounded-2xl hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
              Preparar Sessão <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Alertas Rápidos */}
        <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm space-y-8">
          <h3 className="text-xl font-black text-indigo-950 flex items-center gap-3">
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
        <h1 className="text-4xl font-black text-indigo-950">Olá, Atleta</h1>
        <p className="text-zinc-500 font-medium italic">Foco e Disciplina para o dia de hoje.</p>
      </div>

      <div className="p-10 bg-indigo-900 text-white rounded-[40px] shadow-2xl shadow-indigo-200 space-y-8">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <CheckCircle2 size={32} /> Checklist Diário
        </h2>
        
        <div className="space-y-4">
          <PlayerCheckItem label="Responder Questionário PSR" done={false} />
          <PlayerCheckItem label="Confirmar Presença no Treino" done={true} />
          <PlayerCheckItem label="Visualizar clips da sessão anterior" done={false} />
        </div>
      </div>

      <div className="p-10 bg-white border border-zinc-200 rounded-[40px] shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-indigo-950">Agenda do Dia</h3>
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-black uppercase rounded-full">
            {todaySession?.time}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center text-indigo-950">
            <Calendar size={32} />
          </div>
          <div className="space-y-1">
            <div className="font-black text-indigo-950 text-2xl leading-none">{todaySession?.title}</div>
            <p className="text-lg font-bold text-zinc-400">{todaySession?.location}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KPICard({ title, value, sub, icon, color }: any) {
  return (
    <div className="p-8 bg-white border border-zinc-200 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all group">
      <div className="flex items-center justify-between">
        <div className={`p-3 ${color} rounded-2xl group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      <div className="mt-6 space-y-1">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="text-4xl font-black text-indigo-950 tracking-tight">{value}</div>
        <p className="text-[10px] font-bold text-zinc-500">{sub}</p>
      </div>
    </div>
  )
}

function AlertItem({ name, issue, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-indigo-200 transition-all cursor-default">
      <div>
        <div className="text-sm font-black text-indigo-950">{name}</div>
        <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">{issue}</div>
      </div>
      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
        status === 'Condicionado' ? 'bg-amber-100 text-amber-700' : 
        status === 'Indisponível' ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
      }`}>
        {status}
      </span>
    </div>
  )
}

function PlayerCheckItem({ label, done }: any) {
  return (
    <div className={`flex items-center justify-between p-5 rounded-3xl transition-all ${
      done ? 'bg-white/10 opacity-60' : 'bg-white text-indigo-950'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
          done ? 'bg-indigo-400 border-indigo-400 text-white' : 'border-indigo-100'
        }`}>
          {done && <CheckCircle2 size={18} />}
        </div>
        <span className={`text-lg font-black ${done ? 'line-through text-indigo-300' : ''}`}>{label}</span>
      </div>
      {!done && <ChevronRight size={24} className="text-indigo-100" />}
    </div>
  )
}
