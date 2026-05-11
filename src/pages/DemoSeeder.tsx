import { useState } from 'react'
import { collection, addDoc, Timestamp, setDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase/client'
import { Database, Zap, Shield, Users, Stethoscope, Target } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DemoSeeder() {
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('')
  const navigate = useNavigate()

  const seedData = async () => {
    setLoading(true)
    try {
      // 1. Criar Clube
      setStep('A criar Clube Identity...')
      const clubId = 'demo_coachos'
      await setDoc(doc(db, 'clubs', clubId), {
        name: 'CoachOS Demo Club',
        initials: 'cos',
        description: 'Clube de demonstração para testes de funcionalidades.',
        createdAt: Timestamp.now()
      })

      // 2. Criar Época
      setStep('A configurar Época 2026...')
      const seasonRef = await addDoc(collection(db, 'seasons'), {
        name: 'Época 2026/27',
        active: true,
        clubId,
        createdAt: Timestamp.now()
      })

      // 3. Criar Equipas
      setStep('A gerar Equipas (Sub19, Seniores)...')
      const sub19Ref = await addDoc(collection(db, 'teams'), {
        name: 'Sub-19 A',
        shortName: 'U19',
        seasonId: seasonRef.id,
        clubId,
        createdAt: Timestamp.now()
      })

      const senioresRef = await addDoc(collection(db, 'teams'), {
        name: 'Seniores Masc.',
        shortName: 'SEN',
        seasonId: seasonRef.id,
        clubId,
        createdAt: Timestamp.now()
      })

      // 4. Criar Perfis de Staff (Firestore)
      setStep('A preparar Perfis de Staff...')
      const staffMembers = [
        { email: 'sub19.treinador@cos.pt', role: 'equipatecnica', category: 'Treinador', prefix: 'sub19', name: 'João Treinador' },
        { email: 'medico.fisioterapia@cos.pt', role: 'medico', category: 'Fisioterapeuta', prefix: 'medico', name: 'Dr. Pedro Silva' },
        { email: 'udia.psicologia@cos.pt', role: 'udia', category: 'Psicologo', prefix: 'udia', name: 'Ana Psicologia' },
        { email: 'gr.treinador@cos.pt', role: 'gr', category: 'TreinadorGR', prefix: 'gr', name: 'Rui Guarda-Redes' }
      ]

      for (const s of staffMembers) {
        await addDoc(collection(db, 'users'), {
          displayName: s.name,
          email: s.email,
          role: s.role,
          category: s.category,
          clubId,
          teams: s.role === 'equipatecnica' ? [sub19Ref.id] : [],
          mustChangePassword: true,
          tempPassword: `${s.prefix}2026`,
          createdAt: Timestamp.now()
        })
      }

      // 5. Criar Atletas e Dados PSR
      setStep('A carregar Plantel e Métricas...')
      const players = [
        { name: 'Ricardo Quaresma', number: 7, position: 'Extremo' },
        { name: 'Nuno Mendes', number: 5, position: 'Lateral' },
        { name: 'Vitor Baía', number: 1, position: 'GR' }
      ]

      for (const p of players) {
        const pRef = await addDoc(collection(db, 'players'), {
          ...p,
          teamId: sub19Ref.id,
          clubId,
          status: 'disponivel'
        })

        // Adicionar dados PSR (Bem-estar) fictícios
        await addDoc(collection(db, 'psr_responses'), {
          playerId: pRef.id,
          teamId: sub19Ref.id,
          date: Timestamp.now(),
          sleep: 4,
          stress: 2,
          fatigue: 3,
          soreness: 1,
          mood: 5
        })
      }

      setStep('Concluído!')
      alert('Ambiente Demo configurado com sucesso!\n\nPodes agora testar os logins com as credenciais fornecidas.')
      navigate('/clube/acessos')
    } catch (err) {
      console.error(err)
      alert('Erro no setup: ' + err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 p-6 font-sans">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[48px] p-12 space-y-8 text-center shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-600/10 blur-[100px] rounded-full"></div>
        
        <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 animate-bounce">
          <Database size={40} />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">CoachOS Seeder</h1>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed">
            Isto vai resetar e criar um ambiente de teste completo com Clubes, Staff, Equipas e Dashboards.
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={seedData}
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {loading ? 'A preparar tudo...' : (
              <>
                Gerar Ambiente Demo <Zap size={20} fill="currentColor" />
              </>
            )}
          </button>
          
          {loading && (
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-[10px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">
              {step}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
           <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left">
              <Users size={16} className="text-zinc-600 mb-2" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-tight">4 Perfis Staff Gerados</p>
           </div>
           <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left">
              <Shield size={16} className="text-zinc-600 mb-2" />
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-tight">Clube & Iniciais (cos)</p>
           </div>
        </div>
      </div>
    </div>
  )
}
