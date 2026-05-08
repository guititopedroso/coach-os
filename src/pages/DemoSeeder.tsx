import { useState } from 'react'
import { collection, addDoc, Timestamp, deleteDoc, getDocs, query } from 'firebase/firestore'
import { db } from '../lib/firebase/client'
import { Database, Zap, Trash2, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DemoSeeder() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const seedData = async () => {
    setLoading(true)
    try {
      // 1. Criar Época
      const seasonRef = await addDoc(collection(db, 'seasons'), {
        name: 'Época Demo 2026',
        active: true,
        createdAt: Timestamp.now()
      })

      // 2. Criar Equipas
      const teamARef = await addDoc(collection(db, 'teams'), {
        name: 'Seniores Masc.',
        seasonId: seasonRef.id,
        seasonName: 'Época Demo 2026',
        createdAt: Timestamp.now()
      })

      // 3. Criar Atletas de Teste
      const athletes = [
        { name: 'Cristiano Ronaldo', number: 7, position: 'Avançado', status: 'disponivel' },
        { name: 'Bernardo Silva', number: 10, position: 'Médio', status: 'disponivel' },
        { name: 'Diogo Costa', number: 1, position: 'GR', status: 'disponivel' },
        { name: 'Pepe', number: 3, position: 'Defesa', status: 'condicionado' }
      ]

      for (const a of athletes) {
        await addDoc(collection(db, 'players'), {
          ...a,
          teamId: teamARef.id,
          clubId: 'default_club'
        })
      }

      // 4. Criar Eventos de Planeamento
      const eventDate = new Date()
      await addDoc(collection(db, 'events'), {
        title: 'Treino de Recuperação',
        type: 'treino',
        date: Timestamp.fromDate(eventDate),
        status: 'published',
        teamId: teamARef.id
      })

      alert('Dados Demo criados com sucesso!')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      alert('Erro ao criar dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 space-y-8 text-center shadow-2xl">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-black">
          <Database size={40} />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white italic underline decoration-indigo-500">Demo Setup</h1>
          <p className="text-zinc-500 font-medium">Carrega dados de teste para veres o CoachOS a trabalhar imediatamente.</p>
        </div>

        <button 
          onClick={seedData}
          disabled={loading}
          className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 shadow-xl shadow-indigo-900/20 active:scale-95"
        >
          {loading ? 'A processar...' : (
            <>
              Carregar Dados Demo <Zap size={20} />
            </>
          )}
        </button>

        <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
          Aviso: Isto irá adicionar novas épocas, equipas e jogadores à tua base de dados.
        </p>
      </div>
    </div>
  )
}
