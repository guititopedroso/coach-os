import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, addDoc, Timestamp, doc, getDoc, where, deleteDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { 
  UserPlus, 
  Users, 
  Stethoscope, 
  Target, 
  ShieldCheck, 
  Download, 
  RefreshCcw, 
  Trash2,
  AlertTriangle,
  Mail,
  Lock,
  ChevronRight,
  Briefcase
} from 'lucide-react'

const STAFF_AREAS = [
  { id: 'equipatecnica', label: 'Equipa Técnica', icon: <Users size={16} />, color: 'text-blue-500' },
  { id: 'atleta', label: 'Jogadores', icon: <Target size={16} />, color: 'text-emerald-500' },
  { id: 'medico', label: 'Dep. Médico', icon: <Stethoscope size={16} />, color: 'text-rose-500' },
  { id: 'udia', label: 'UDIA', icon: <Target size={16} />, color: 'text-purple-500' },
  { id: 'gr', label: 'Treinador GR', icon: <ShieldCheck size={16} />, color: 'text-amber-500' },
  { id: 'staff', label: 'Administrativo/Staff', icon: <Briefcase size={16} />, color: 'text-zinc-400' }
]

const TIPO_OPCOES: Record<string, string[]> = {
  equipatecnica: ['Treinador', 'Adjunto', 'Analista', 'PrepFisico'],
  atleta: ['Jogador', 'Capitao'],
  medico: ['Fisioterapeuta', 'Medico', 'Nutricionista', 'Enfermeiro'],
  udia: ['Psicologo', 'Associal'],
  gr: ['TreinadorGR'],
  staff: ['Secretario', 'Diretor', 'Logistica', 'Marketing']
}

export default function Access() {
  const [clubInitials, setClubInitials] = useState('clube')
  const [activeArea, setActiveArea] = useState('equipatecnica')
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [name, setName] = useState('')
  const [prefixo, setPrefixo] = useState('') // Ex: sub19 ou medico
  const [tipoSelecionado, setTipoSelecionado] = useState('')
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    // Reset tipo ao mudar de area
    setTipoSelecionado(TIPO_OPCOES[activeArea]?.[0] || '')
    // Auto-fill prefixo se for unidade fixa
    if (['medico', 'udia', 'gr', 'staff'].includes(activeArea)) {
      setPrefixo(activeArea)
    } else {
      setPrefixo('')
    }
  }, [activeArea])

  const fetchData = async () => {
    setLoading(true)
    const cSnap = await getDoc(doc(db, 'clubs', 'default_club'))
    if (cSnap.exists()) setClubInitials(cSnap.data().initials || 'clube')

    const tSnap = await getDocs(query(collection(db, 'teams')))
    setTeams(tSnap.docs.map(d => ({ id: d.id, ...d.data() })))

    const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')

  const generateEmail = () => {
    const pre = normalize(prefixo)
    const cat = normalize(tipoSelecionado)
    return `${pre}.${cat}@${clubInitials}.pt`
  }

  const generateTempPassword = () => {
    const pre = normalize(prefixo)
    return `${pre}2026`
  }

  async function deleteAccount(id: string) {
    if (!confirm('Eliminar esta conta permanentemente?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Erro ao eliminar conta:', err);
    }
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prefixo || !tipoSelecionado) return

    const email = generateEmail()
    const tempPassword = generateTempPassword()

    try {
      await addDoc(collection(db, 'users'), {
        displayName: name || `${prefixo} ${tipoSelecionado}`,
        email,
        tempPassword,
        role: activeArea, // area principal
        category: tipoSelecionado, // funcao especifica
        clubId: 'default_club',
        teams: selectedTeam ? [selectedTeam] : [],
        mustChangePassword: true,
        createdAt: Timestamp.now(),
        status: 'active'
      })
      
      setName('')
      if (!['medico', 'udia', 'gr', 'staff'].includes(activeArea)) setPrefixo('')
      fetchData()
      alert(`Conta criada com sucesso!\n\nEmail: ${email}\nPassword: ${tempPassword}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1 text-left">
          <h1 className="text-4xl font-black text-white italic">Utilizadores & Logins</h1>
          <p className="text-zinc-500 font-medium">Gestão centralizada de credenciais padronizadas para todo o staff.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-xl flex items-center gap-2 hover:text-white transition-all text-xs uppercase tracking-widest">
            <Download size={16} /> Exportar Lista
          </button>
        </div>
      </div>

      {/* Tabs de Áreas - Seleção de quem estamos a criar */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {STAFF_AREAS.map(area => (
          <button 
            key={area.id}
            onClick={() => setActiveArea(area.id)}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all border whitespace-nowrap ${
              activeArea === area.id ? 'bg-white text-black border-white shadow-xl shadow-white/5' : 'bg-zinc-900/50 text-zinc-500 border-zinc-900 hover:border-zinc-800'
            }`}
          >
            <span className={activeArea === area.id ? 'text-black' : area.color}>{area.icon}</span>
            {area.label}
          </button>
        ))}
      </div>

      {/* Gerador de Contas */}
      <section className="p-10 bg-zinc-900/40 border border-zinc-900 rounded-[48px] space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          {STAFF_AREAS.find(a => a.id === activeArea)?.icon}
        </div>

        <div className="flex items-center gap-3 text-white font-black uppercase tracking-[0.2em] text-xs">
          <UserPlus size={18} className="text-indigo-500" /> 
          Criar Novo Login: <span className="text-indigo-400">{STAFF_AREAS.find(a => a.id === activeArea)?.label}</span>
        </div>
        
        <form onSubmit={handleCreateAccount} className="grid md:grid-cols-4 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">
              {['equipatecnica', 'atleta'].includes(activeArea) ? 'Escalão' : 'Unidade'}
            </label>
            <input 
              type="text"
              placeholder={['equipatecnica', 'atleta'].includes(activeArea) ? "Ex: sub19, seniores" : "Ex: medico, udia"}
              value={prefixo}
              onChange={(e) => setPrefixo(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:border-indigo-500 outline-none transition-all font-black text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Função / Tipo</label>
            <select 
              value={tipoSelecionado}
              onChange={(e) => setTipoSelecionado(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none font-black text-white appearance-none cursor-pointer focus:border-indigo-500"
            >
              {TIPO_OPCOES[activeArea]?.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nome (Opcional)</label>
            <input 
              type="text"
              placeholder="Ex: João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-5 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-indigo-500 transition-all font-bold text-white"
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit"
              disabled={!prefixo || !tipoSelecionado}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/10 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Gerar Credenciais
            </button>
          </div>
        </form>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl flex items-center gap-6 group hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Email Gerado</p>
              <p className="font-mono text-sm text-indigo-400 font-bold">
                {prefixo && tipoSelecionado ? generateEmail() : 'aguardando dados...'}
              </p>
            </div>
          </div>
          <div className="p-6 bg-zinc-950/50 border border-zinc-800 rounded-3xl flex items-center gap-6 group hover:border-zinc-700 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:text-white transition-all">
              <Lock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Password Temporária</p>
              <p className="font-mono text-sm text-amber-500 font-bold">
                {prefixo ? generateTempPassword() : 'aguardando dados...'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabela de Utilizadores da Área Ativa */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-black text-white italic flex items-center gap-3">
             <Users size={20} className="text-zinc-600" /> 
             {STAFF_AREAS.find(a => a.id === activeArea)?.label} Ativos
           </h3>
        </div>

        <div className="bg-zinc-900/30 border border-zinc-900 rounded-[40px] overflow-hidden">
          <div className="grid grid-cols-6 p-6 border-b border-zinc-900 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-900/50">
            <div className="col-span-2">Utilizador / Email</div>
            <div>Função</div>
            <div>Escalão/Unidade</div>
            <div>Estado</div>
            <div className="text-right">Ações</div>
          </div>

          <div className="divide-y divide-zinc-900/50">
            {loading ? (
              <div className="p-20 text-center text-zinc-700 italic font-medium">A sincronizar base de dados...</div>
            ) : users.filter(u => u.role === activeArea).length === 0 ? (
              <div className="p-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs">
                Nenhuma conta criada nesta área.
              </div>
            ) : users.filter(u => u.role === activeArea).map(user => (
              <div key={user.id} className="grid grid-cols-6 p-6 items-center hover:bg-white/2 transition-all group border-l-2 border-l-transparent hover:border-l-indigo-500">
                <div className="col-span-2 flex items-center gap-4 text-left">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-zinc-500 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-lg">
                    {user.displayName?.[0]}
                  </div>
                  <div>
                    <div className="font-black text-white">{user.displayName}</div>
                    <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                      <Mail size={10} /> {user.email}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="px-2 py-1 bg-zinc-950 border border-zinc-800 rounded-lg text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                    {user.category}
                  </span>
                </div>
                <div className="text-xs font-bold text-zinc-400">
                   {user.email.split('.')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${user.mustChangePassword ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                    <span className="text-[9px] font-black uppercase text-zinc-500">
                      {user.mustChangePassword ? 'Senha Pendente' : 'Ativo'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button title="Reset Password" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all border border-zinc-800">
                    <RefreshCcw size={16} />
                  </button>
                  <button onClick={() => deleteAccount(user.id)} title="Eliminar" className="p-3 bg-zinc-900 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500 transition-all border border-zinc-800">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
