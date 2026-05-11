import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white">
      {/* Hero Header */}
      <div className="relative h-[400px] flex flex-col justify-center px-8 md:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80" 
            alt="Stadium Background" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto w-full space-y-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors font-bold text-sm bg-white/10 px-4 py-2 rounded-full w-fit backdrop-blur-md border border-white/10">
            <ArrowLeft size={16} /> Voltar à página inicial
          </Link>

          <header className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">Política de Privacidade</h1>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">Última atualização: Maio de 2026</p>
          </header>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-20 max-w-4xl mx-auto px-6 pb-32 -mt-20">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-slate-100 p-10 md:p-16">
          <section className="space-y-12 text-slate-600 leading-relaxed text-lg font-medium">
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                Recolha de Dados
              </h2>
              <p>A sua privacidade é importante para nós. É política do CoachOS respeitar a sua privacidade em relação a qualquer informação sua que possamos recolher no site CoachOS e outros sites que possuímos e operamos.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">2</span>
                Uso de Informações
              </h2>
              <p>Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento.</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-sm">3</span>
                Segurança
              </h2>
              <p>Protegemos os dados armazenados dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
            </div>
          </section>

          <footer className="mt-16 pt-8 border-t border-slate-100 text-sm text-slate-400 font-bold text-center">
            © 2026 CoachOS. A tua privacidade é a nossa prioridade.
          </footer>
        </div>
      </div>
    </div>
  )
}

