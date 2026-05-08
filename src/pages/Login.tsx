import { useState } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth, db } from '../../lib/firebase/client'
import { doc, setDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { Trophy, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('admin_clube') // admin_clube ou staff
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
        // Guardar role para o Layout saber o que mostrar
        localStorage.setItem('user_role', email.includes('treinador') ? 'staff' : 'admin_clube')
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(userCredential.user, { displayName: name })
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: name,
          email,
          role, // admin_clube ou staff
          createdAt: new Date()
        })
        localStorage.setItem('user_role', role)
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-white/10">
            <Trophy className="text-black" size={32} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter italic">CoachOS</h1>
          <p className="text-zinc-500 font-medium">
            {isLogin ? 'Bem-vindo de volta ao centro de comando.' : 'Cria a conta do teu clube agora.'}
          </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-900 p-10 rounded-[40px] shadow-2xl space-y-8">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input 
                    type="text" required
                    value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold"
                    placeholder="Ex: José Mourinho"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Email Profissional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold"
                  placeholder="email@clube.pt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Cargo no Clube</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <select 
                    value={role} onChange={(e) => setRole(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold appearance-none"
                  >
                    <option value="admin_clube">Coordenação (Admin)</option>
                    <option value="staff">Equipa Técnica (Treinador)</option>
                  </select>
                </div>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
            >
              {loading ? 'A processar...' : (
                <>
                  {isLogin ? 'Entrar no Sistema' : 'Criar Conta'} <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-zinc-500 hover:text-white transition-colors"
            >
              {isLogin ? 'Ainda não tens conta? Regista o teu clube' : 'Já tens conta? Faz login aqui'}
            </button>
          </div>
        </div>

        <div className="text-center text-[10px] font-bold text-zinc-700 uppercase tracking-[0.3em]">
          CoachOS Security System • RGPD Compliant
        </div>
      </div>
    </div>
  )
}
