import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../lib/firebase/client'
import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { Trophy, CreditCard, ShieldCheck, ArrowRight, Mail, Lock, Building } from 'lucide-react'

export default function RegisterClub() {
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || 'Starter'
  const navigate = useNavigate()

  const [clubName, setClubName] = useState('')
  const [initials, setInitials] = useState('')
  const [adminName, setAdminName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Criar utilizador no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName: adminName })

      // 2. Criar Documento do Clube
      const clubRef = await addDoc(collection(db, 'clubs'), {
        name: clubName,
        initials: initials.toLowerCase().replace(/\s/g, ''),
        plan: plan,
        ownerId: userCredential.user.uid,
        createdAt: new Date()
      })

      // 3. Criar Documento do Utilizador (Admin)
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        displayName: adminName,
        email,
        role: 'admin_clube',
        clubId: clubRef.id,
        mustChangePassword: false, // O Admin cria a sua própria senha
        createdAt: new Date()
      })

      localStorage.setItem('user_role', 'admin_clube')
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 font-sans overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1431324155629-1a6fc1ac1e73?auto=format&fit=crop&q=80" 
          alt="Stadium Background" 
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-10 animate-in fade-in zoom-in duration-700">
        
        {/* Lado Esquerdo: Info do Plano */}
        <div className="space-y-8 flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
              <Trophy size={20} />
            </div>
            <span className="text-2xl font-black text-white italic tracking-tighter">CoachOS</span>
          </div>
          
          <div className="space-y-4">
            <div className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
              Plano Selecionado
            </div>
            <h1 className="text-5xl font-black text-white leading-none">Plano {plan}</h1>
            <p className="text-zinc-400 font-medium text-lg">
              Estás a um passo de digitalizar o teu clube. Preenche os dados para criar a tua infraestrutura.
            </p>
          </div>

          <div className="space-y-4">
            <Benefit item="Domínio de email personalizado" />
            <Benefit item="Workspace de Administração" />
            <Benefit item="Suporte Prioritário" />
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl shadow-black/50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Building size={100} />
          </div>

          <h2 className="text-2xl font-black text-white italic">Configura o teu Clube</h2>
          
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Nome do Clube</label>
                <input 
                  type="text" required
                  value={clubName} onChange={(e) => setClubName(e.target.value)}
                  className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                  placeholder="Ex: G.D. Águias"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Iniciais (Padrão)</label>
                <input 
                  type="text" required maxLength={5}
                  value={initials} onChange={(e) => setInitials(e.target.value)}
                  className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-black placeholder:text-zinc-600 uppercase"
                  placeholder="gdao"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Administrador do Clube</label>
              <input 
                type="text" required
                value={adminName} onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                placeholder="Nome do Responsável"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email de Login</label>
              <input 
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                placeholder="admin@clube.pt"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Palavra-passe</label>
              <input 
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                placeholder="••••••••"
              />
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'A criar infraestrutura...' : (
                <>
                  Confirmar Subscrição <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

function Benefit({ item }: { item: string }) {
  return (
    <div className="flex items-center gap-3 text-zinc-400 font-bold text-sm">
      <div className="w-5 h-5 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500">
        <ShieldCheck size={14} />
      </div>
      {item}
    </div>
  )
}
