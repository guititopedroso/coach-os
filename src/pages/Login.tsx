import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../lib/firebase/client'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate, Link } from 'react-router-dom'
import { Trophy, Mail, Lock, ArrowRight } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      
      // Buscar o role real do Firestore
      const userSnap = await getDoc(doc(db, 'users', userCredential.user.uid))
      if (userSnap.exists()) {
        const role = userSnap.data().role
        localStorage.setItem('user_role', role)
      }

      navigate('/dashboard')
    } catch (err: any) {
      setError('Credenciais inválidas. Verifica o teu email e password.')
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

      <div className="relative z-10 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-600/20">
            <Trophy className="text-white" size={32} />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tighter italic">CoachOS</h1>
          <p className="text-zinc-500 font-medium">Acede ao centro de comando do teu clube.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[40px] shadow-2xl shadow-black/50 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Trophy size={100} />
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold text-center relative z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Email Profissional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                  placeholder="ex: treinador@clube.pt"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-white/10 rounded-2xl focus:border-blue-500 focus:bg-zinc-900/80 outline-none transition-all text-white font-bold placeholder:text-zinc-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'A validar...' : (
                <>
                  Entrar no Workspace <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>


        <div className="text-center">
          <Link to="/" className="text-xs font-bold text-zinc-600 hover:text-white transition-colors">
            ← Voltar para a Landing Page
          </Link>
        </div>
      </div>
    </div>
  )
}
