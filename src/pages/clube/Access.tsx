import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore'
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
  Lock
} from 'lucide-react'

const AREAS = [
  { id: 'equipatecnica', label: 'Equipa Técnica', icon: <Users size={16} /> },
  { id: 'atleta', label: 'Jogadores', icon: <Target size={16} /> },
  { id: 'medico', label: 'Dep. Médico', icon: <Stethoscope size={16} /> },
  { id: 'udia', label: 'UDIA', icon: <Target size={16} /> },
  { id: 'gr', label: 'Treinador GR', icon: <ShieldCheck size={16} /> },
  { id: 'staff', label: 'Outro Staff', icon: <Users size={16} /> }
]

export default function Access() {
  const [clubInitials, setClubInitials] = useState('clube')
  const [activeArea, setActiveArea] = useState('equipatecnica')
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [name, setName] = useState('')
  const [escalaoOuUnidade, setEscalaoOuUnidade] = useState('')
  const [tipo, setTipo] = useState('equipatecnica')
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const cSnap = await getDoc(doc(db, 'clubs', 'default_club'))
    if (cSnap.exists()) setClubInitials(cSnap.data().initials || 'clube')

    const tSnap = await getDocs(query(collection(db, 'teams')))
    const tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setTeams(tList)
    if (tList.length > 0) setSelectedTeam(tList[0].id)

    const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '')

  const generateEmail = () => {
    const prefix = normalize(escalaoOuUnidade)
    const category = normalize(tipo)
    return `${prefix}.${category}@${clubInitials}.pt`
  }

  const generateTempPassword = () => {
    const prefix = normalize(escalaoOuUnidade)
    return `${prefix}2026`
  }

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!escalaoOuUnidade) return

    const email = generateEmail()
    const tempPassword = generateTempPassword()

    try {
      await addDoc(collection(db, 'users'), {
        displayName: name || escalaoOuUnidade,
        email,
        tempPassword, // Apenas para o Admin ver inicialmente ou exportar
        role: tipo, // area selecionada
        area: activeArea,
        clubId: 'default_club',
        teams: selectedTeam ? [selectedTeam] : [],
        mustChangePassword: true,
        createdAt: Timestamp.now(),
        status: 'active'
      })
      
      setEscalaoOuUnidade('')
      setName('')
      fetchData()
      alert(`Conta criada!\nEmail: ${email}\nPassword: ${tempPassword}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black text-white italic">Utilizadores & Logins</h1>
          <p className="text-zinc-500 font-medium">Gere as credenciais padronizadas de todo o staff e atletas.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold rounded-xl flex items-center gap-2 hover:text-white transition-all">
            <Download size={18} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Gerador de Contas Padronizadas */}
      <section className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <ShieldCheck size={120} />
        </div>

        <div className="flex items-center gap-2 text-white font-black uppercase tracking-[0.2em] text-xs">
          <UserPlus size={16} className="text-indigo-500" /> Gerar Login Padronizado
        </div>
        
        <form onSubmit={handleCreateAccount} className="grid md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Escalão ou Unidade</label>
            <input 
              type="text"
              placeholder="Ex: Iniciados A, Medico, UDIA"
              value={escalaoOuUnidade}
              onChange={(e) => setEscalaoOuUnidade(e.target.value)}
              className="w-full px-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all font-bold"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Tipo de Conta</label>
            <select 
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl outline-none font-bold"
            >
              {AREAS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Visualização do Email</label>
            <div className="w-full px-4 py-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-500 font-mono text-sm truncate flex items-center gap-2">
              <Mail size={14} /> {escalaoOuUnidade ? generateEmail() : 'aguardando dados...'}
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl shadow-white/5 active:scale-95">
              Criar Credenciais
            </button>
          </div>
        </form>

        <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-4">
          <AlertTriangle className="text-indigo-500 shrink-0" size={20} />
          <p className="text-[11px] text-zinc-500 font-bold leading-relaxed">
            Todas as contas geradas terão <span className="text-white">troca obrigatória de password</span> no primeiro acesso. 
            A password temporária será: <span className="text-white font-mono">{escalaoOuUnidade ? generateTempPassword() : '...'}</span>
          </p>
        </div>
      </section>

      {/* Tabs de Áreas */}
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {AREAS.map(area => (
            <button 
              key={area.id}
              onClick={() => setActiveArea(area.id)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all border whitespace-nowrap ${
                activeArea === area.id ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-500 border-zinc-900 hover:border-zinc-800'
              }`}
            >
              {area.icon} {area.label}
            </button>
          ))}
        </div>

        {/* Tabela de Utilizadores */}
        <div className="bg-zinc-900/30 border border-zinc-900 rounded-[40px] overflow-hidden">
          <div className="grid grid-cols-5 p-6 border-b border-zinc-900 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-zinc-900/50">
            <div className="col-span-2">Utilizador / Email</div>
            <div>Função</div>
            <div>Estado</div>
            <div className="text-right">Ações</div>
          </div>

          <div className="divide-y divide-zinc-900/50">
            {loading ? (
              <div className="p-20 text-center text-zinc-700 italic font-medium">A sincronizar base de dados...</div>
            ) : users.filter(u => u.area === activeArea || (activeArea === 'equipatecnica' && u.role === 'staff')).map(user => (
              <div key={user.id} className="grid grid-cols-5 p-6 items-center hover:bg-zinc-900/20 transition-all group">
                <div className="col-span-2 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center font-black text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
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
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{user.role}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.mustChangePassword ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <span className="text-[10px] font-black uppercase text-zinc-500">
                      {user.mustChangePassword ? 'Senha Pendente' : 'Ativo'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button title="Reset Password" className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-all">
                    <RefreshCcw size={16} />
                  </button>
                  <button title="Eliminar" className="p-3 bg-zinc-900 hover:bg-rose-500/10 rounded-xl text-zinc-500 hover:text-rose-500 transition-all">
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
