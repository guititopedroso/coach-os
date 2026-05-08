import { useState } from 'react'
import { updatePassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase/client'
import { doc, updateDoc } from 'firebase/firestore'
import { Lock, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ForcePasswordChange() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    if (newPassword.length < 8) return 'A password deve ter pelo menos 8 caracteres.'
    if (!/\d/.test(newPassword)) return 'A password deve conter pelo menos um número.'
    if (newPassword !== confirmPassword) return 'As passwords não coincidem.'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) return setError(err)

    setLoading(true)
    try {
      const user = auth.currentUser
      if (user) {
        await updatePassword(user, newPassword)
        await updateDoc(doc(db, 'users', user.uid), {
          mustChangePassword: false,
          updatedAt: new Date()
        })
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-white/10">
            <ShieldCheck className="text-black" size={32} />
          </div>
          <h1 className="text-3xl font-black text-white italic tracking-tighter">Segurança Obrigatória</h1>
          <p className="text-zinc-500 font-medium">Estás a usar uma credencial temporária. Para continuar, define uma password pessoal e segura.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 bg-zinc-900/50 border border-zinc-900 rounded-[40px] shadow-2xl space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Nova Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold"
                  placeholder="Mínimo 8 caracteres + 1 número"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-1">Confirmar Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                <input 
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-950 border border-zinc-900 rounded-2xl focus:border-white outline-none transition-all text-white font-bold"
                  placeholder="Repete a password"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 ${newPassword.length >= 8 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
              <CheckCircle2 size={12} /> 8+ Caracteres
            </div>
            <div className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-tight flex items-center gap-2 ${/\d/.test(newPassword) ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-zinc-950 border-zinc-900 text-zinc-600'}`}>
              <CheckCircle2 size={12} /> Inclui Número
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
            {loading ? 'A processar...' : (
              <>
                Ativar Conta <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] font-black text-zinc-700 uppercase tracking-[0.4em]">
          CoachOS Security Protocols
        </p>
      </div>
    </div>
  )
}
