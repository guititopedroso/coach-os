import { useState } from 'react'
import { collection, addDoc, Timestamp } from 'firebase/firestore'
import { db, auth } from '../../lib/firebase/client'
import { useNavigate } from 'react-router-dom'
import { ClipboardCheck, Star, Save, ArrowLeft } from 'lucide-react'

export default function Questionnaire() {
  const [type, setType] = useState<'psr' | 'pse' | 'post-match'>('psr')
  const [responses, setResponses] = useState<any>({
    sono: 3,
    stress: 3,
    fadiga: 3,
    dor: 3,
    humor: 3
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await addDoc(collection(db, 'questionnaires'), {
        type,
        userId: auth.currentUser?.uid || 'anonymous',
        userName: auth.currentUser?.displayName || 'Atleta Teste',
        date: Timestamp.now(),
        responses,
        clubId: 'default_club',
        teamId: 'default_team'
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateResponse = (key: string, value: number) => {
    setResponses({ ...responses, [key]: value })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-12 animate-in fade-in duration-700 py-12 px-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all font-bold text-sm">
        <ArrowLeft size={16} /> Voltar
      </button>

      <div className="space-y-4 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto text-black">
          <ClipboardCheck size={32} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Questionário PSR</h1>
        <p className="text-zinc-400">Avalia como te sentes hoje para podermos ajustar o treino.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <QuestionItem 
          label="Qualidade do Sono" 
          value={responses.sono} 
          onChange={(v) => updateResponse('sono', v)} 
          low="Péssimo" 
          high="Excelente" 
        />
        <QuestionItem 
          label="Nível de Fadiga" 
          value={responses.fadiga} 
          onChange={(v) => updateResponse('fadiga', v)} 
          low="Exausto" 
          high="Fresco" 
        />
        <QuestionItem 
          label="Nível de Stress" 
          value={responses.stress} 
          onChange={(v) => updateResponse('stress', v)} 
          low="Muito Stress" 
          high="Relaxado" 
        />
        <QuestionItem 
          label="Dores Musculares" 
          value={responses.dor} 
          onChange={(v) => updateResponse('dor', v)} 
          low="Muita Dor" 
          high="Sem Dor" 
        />

        <button 
          disabled={loading}
          className="w-full py-4 bg-white text-black font-extrabold rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 text-lg active:scale-95"
        >
          {loading ? 'A enviar...' : (
            <>
              Submeter Respostas <Save size={20} />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

function QuestionItem({ label, value, onChange, low, high }: { label: string, value: number, onChange: (v: number) => void, low: string, high: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <h3 className="text-lg font-bold text-white">{label}</h3>
        <span className="text-3xl font-black text-white">{value}</span>
      </div>
      
      <div className="space-y-2">
        <input 
          type="range" 
          min="1" 
          max="5" 
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-3 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1">
          <span>{low}</span>
          <span>{high}</span>
        </div>
      </div>
    </div>
  )
}
