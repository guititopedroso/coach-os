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
  const [staffRole, setStaffRole] = useState('Principal')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const tSnap = await getDocs(query(collection(db, 'teams')))
    const tList = tSnap.docs.map(d => ({ id: d.id, ...d.data() }))
    setTeams(tList)
    if (tList.length > 0) setSelectedTeam(tList[0].id)

    // Em produção, filtraríamos por clubId
    const uSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')))
    setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

    try {
      // Nota: Em produção usaríamos uma Cloud Function para criar o user no Auth
      // Para este MVP, vamos simular a criação do perfil
      await addDoc(collection(db, 'users'), {
        displayName: name,
        email,
        role,
        clubId: 'default_club', // Simulado
        teams: [selectedTeam],
        staffRole: role === 'staff' ? staffRole : null,
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
          <ClipboardCheck className="text-zinc-500" /> Controlo de Acessos
        </h1>
        <p className="text-zinc-400">Gere as permissões, logins e funções de staff e atletas.</p>
      </div>

      {/* Criar Acesso */}
      <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 text-white font-bold">
          <UserPlus size={20} className="text-zinc-500" /> Convidar Utilizador
        </div>
        
        <form onSubmit={handleAddUser} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase px-1">Nome Completo</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João Silva"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase px-1">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@coach-os.pt"
              className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl focus:ring-2 focus:ring-white outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase px-1">Tipo / Equipa</label>
            <div className="flex gap-2">
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
              >
                <option value="staff">Equipa Técnica</option>
                <option value="jogador">Jogador</option>
                <option value="medico">Dep. Médico</option>
                <option value="gr">Treinador GR</option>
                <option value="udia">UDIA</option>
                <option value="admin_clube">Admin Clube</option>
              </select>
              <select 
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl outline-none"
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <button className="w-full px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all">
              Criar Acesso
            </button>
          </div>
        </form>
      </div>

      {/* Tabela de Utilizadores */}
      <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden text-sm">
        <div className="grid grid-cols-4 p-4 border-b border-zinc-800 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
          <div>Nome / Email</div>
          <div>Função</div>
          <div>Equipa</div>
          <div className="text-right">Ações</div>
        </div>
        
        <div className="divide-y divide-zinc-800/50">
          {loading ? (
            <div className="p-12 text-center text-zinc-600">A processar utilizadores...</div>
          ) : users.map(user => (
            <div key={user.id} className="grid grid-cols-4 p-4 items-center hover:bg-zinc-800/30 transition-all">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-400">
                  {user.displayName[0]}
                </div>
                <div>
                  <div className="font-bold text-white">{user.displayName}</div>
                  <div className="text-xs text-zinc-500">{user.email}</div>
                </div>
              </div>
              <div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight ${
                  user.role === 'admin_clube' ? 'bg-red-500/10 text-red-500' : 
                  user.role === 'staff' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {user.role} {user.staffRole && `(${user.staffRole})`}
                </span>
              </div>
              <div className="text-zinc-400 font-medium">
                {teams.find(t => t.id === user.teams?.[0])?.name || '---'}
              </div>
              <div className="text-right">
                <button className="text-zinc-600 hover:text-white font-bold transition-all px-2">Editar</button>
                <button className="text-zinc-600 hover:text-red-500 font-bold transition-all px-2">Remover</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
