import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { FileDown, Users, Clock, AlertTriangle, ChevronDown } from 'lucide-react'

const COLORS = ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#ef4444']

export default function Analytics() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('psr')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const q = query(collection(db, 'questionnaires'), orderBy('date', 'desc'))
    const snap = await getDocs(q)
    setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  // Simulação de dados para os gráficos
  const chartData = [
    { name: 'Excelente', value: 5 },
    { name: 'Bom', value: 8 },
    { name: 'Médio', value: 4 },
    { name: 'Mau', value: 2 },
    { name: 'Péssimo', value: 1 },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-white">Análise de Dados</h1>
          <p className="text-zinc-400 text-sm">Monitorização física e psicológica dos atletas.</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
          <FileDown size={20} /> Exportar Excel
        </button>
      </div>

      {/* Tabs de Tipo de Questionário */}
      <div className="flex bg-zinc-900/50 p-1 rounded-xl border border-zinc-800 self-start w-fit">
        <TabBtn active={activeTab === 'psr'} onClick={() => setActiveTab('psr')} label="PSR (Diário)" />
        <TabBtn active={activeTab === 'pse'} onClick={() => setActiveTab('pse')} label="PSE (Carga)" />
        <TabBtn active={activeTab === 'post'} onClick={() => setActiveTab('post')} label="Pós-Jogo" />
      </div>

      {/* Grid de KPIs */}
      <div className="grid gap-6 md:grid-cols-3">
        <StatCard title="Taxa de Resposta" value="82%" sub="18/22 Atletas" icon={<Users className="text-zinc-500" />} />
        <StatCard title="Pendentes Hoje" value="4" sub="Miguel, João, +2" icon={<Clock className="text-yellow-500" />} />
        <StatCard title="Alertas Ativos" value="2" sub="Fadiga Elevada" icon={<AlertTriangle className="text-red-500" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Distribuição */}
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Qualidade do Sono</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lista de Respostas Recentes */}
        <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">Respostas Recentes</h3>
          <div className="space-y-4">
            {data.slice(0, 5).map(res => (
              <div key={res.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500 uppercase">
                    {res.userName?.[0]}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{res.userName}</div>
                    <div className="text-[10px] text-zinc-500 uppercase">{res.type} · {res.date?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-400">Score: 4.2</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TabBtn({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
      }`}
    >
      {label}
    </button>
  )
}

function StatCard({ title, value, sub, icon }: any) {
  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</p>
        {icon}
      </div>
      <div className="text-3xl font-extrabold text-white">{value}</div>
      <p className="text-xs text-zinc-500 font-medium">{sub}</p>
    </div>
  )
}
