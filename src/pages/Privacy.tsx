import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-8 md:p-20 selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Voltar à página inicial
        </Link>

        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Política de Privacidade</h1>
          <p className="text-zinc-500">Última atualização: Maio de 2026</p>
        </header>

        <section className="space-y-8 text-zinc-400 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Recolha de Dados</h2>
            <p>A sua privacidade é importante para nós. É política do CoachOS respeitar a sua privacidade em relação a qualquer informação sua que possamos recolher no site CoachOS e outros sites que possuímos e operamos.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Uso de Informações</h2>
            <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Segurança</h2>
            <p>Protegemos os dados armazenados dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
          </div>
        </section>

        <footer className="pt-12 border-t border-zinc-900 text-sm text-zinc-600">
          © 2026 CoachOS. A tua privacidade é a nossa prioridade.
        </footer>
      </div>
    </div>
  )
}
