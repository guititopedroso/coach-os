import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy, addDoc, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase/client'
import { ClipboardCheck, UserPlus, ShieldCheck, Mail, Tag } from 'lucide-react'

export default function Access() {
  const [users, setUsers] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('staff')
  const [selectedTeam, setSelectedTeam] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const tSnap = await getDocs(query(collection(db, 'teams')))
    const tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setTeams(tList)
    if (tList.length > 0) setSelectedTeam(tList[0].id)

    const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    try {
      await addDoc(collection(db, 'users'), {
        displayName: name,
        email,
        role,
        clubId: 'default_club',
        teams: [selectedTeam],
        createdAt: Timestamp.now()
      })
      
      setName('')
      setEmail('')
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <ClipboardCheck className="text-zinc-700" /> Controlo de Acessos
        </h1>
        <p className="text-zinc-500 font-medium">Cria as contas de login para a tua equipa técnica e atletas.</p>
      </div>

      {/* Criar Acesso Premium */}
      <div className="p-8 bg-zinc-900/50 border border-zinc-900 rounded-[32px] space-y-6 shadow-2xl">
        <div className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs">
          <UserPlus size={16} className="text-zinc-500" /> Novo Utilizador
        </div>
        
        <form onSubmit={handleAddUser} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nome</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Email / Login</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl focus:border-white outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Função / Equipa</label>
            <div className="flex gap-2">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl outline-none"
              >
                <option value="staff">Equipa Técnica</option>
                <option value="jogador">Jogador</option>
                <option value="medico">Médico</option>
                <option value="admin_clube">Admin Clube</option>
              </select>
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl outline-none"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-3.5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all shadow-lg">
              Criar Conta
            </button>
          </div>
        </form>
      </div>

      {/* Tabela Escura */}
      <div className="bg-zinc-900/30 border border-zinc-900 rounded-[32px] overflow-hidden">
        <div className="grid grid-cols-4 p-5 border-b border-zinc-900 text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px] bg-zinc-900/50">
          <div>Identificação</div>
          <div>Função</div>
          <div>Equipa</div>
          <div className="text-right">Ações</div>
        </div>
        
        <div className="divide-y divide-zinc-900/50">
          {loading ? (
            <div className="p-12 text-center text-zinc-700 italic font-medium">A carregar utilizadores...</div>
          ) : users.map(user => (
            <div key={user.id} className="grid grid-cols-4 p-5 items-center hover:bg-zinc-900/20 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-black text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
                  {user.displayName?.[0]}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{user.displayName}</div>
                  <div className="text-[10px] text-zinc-600 font-bold">{user.email}</div>
                </div>
              </div>
              <div>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  user.role === 'admin_clube' ? 'bg-red-500/10 text-red-500' : 
                  user.role === 'staff' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-400'
                }`}>
                  {user.role}
                </span>
              </div>
              <div className="text-zinc-500 font-bold text-xs uppercase tracking-tight">
                {teams.find(t => t.id === user.teams?.[0])?.name || '---'}
              </div>
              <div className="text-right">
                <button className="text-zinc-700 hover:text-white font-black text-xs transition-all uppercase tracking-widest p-2">Editar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
