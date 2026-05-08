import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, ClipboardCheck, ArrowRight, Star, Check, HelpCircle, ShieldCheck, Globe } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function LandingPage() {
  const [showCookies, setShowCookies] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setShowCookies(true)
  }, [])

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true')
    setShowCookies(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header / Nav */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto sticky top-0 bg-zinc-950/80 backdrop-blur-md z-50 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <Trophy className="text-black" size={20} />
          </div>
          <span className="text-2xl font-black tracking-tighter">CoachOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Funcionalidades</a>
          <a href="#pricing" className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors">Preços</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors px-4">Entrar</Link>
          <Link to="/register" className="px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all active:scale-95">
            Começar Agora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span>A ferramenta definitiva para clubes de alto rendimento</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95]">
          Gere o teu clube. <br />
          <span className="text-zinc-500">Eleva a performance.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl text-zinc-400 leading-relaxed">
          Centraliza a coordenação, equipa técnica e atletas numa única plataforma. Simples, eficaz e desenhada para vencer.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-white text-black text-lg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all">
            Criar Conta Demo <ArrowRight size={22} />
          </Link>
          <a href="#pricing" className="w-full sm:w-auto px-10 py-5 bg-zinc-900 border border-zinc-800 text-white text-lg font-bold rounded-2xl hover:bg-zinc-800 transition-all">
            Ver Planos de Clube
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-32 bg-zinc-900/30 border-y border-zinc-900">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-black tracking-tight text-white underline decoration-indigo-500 decoration-4 underline-offset-8">Funcionalidades Core</h2>
            <p className="text-zinc-400">Tudo o que precisas para digitalizar o teu clube.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Users />} 
              title="Gestão de Plantel" 
              description="Controlo total de atletas, dados médicos e histórico de performance."
            />
            <FeatureCard 
              icon={<ClipboardCheck />} 
              title="Análise Wellness" 
              description="Questionários PSR e PSE com dashboards automáticos para o staff."
            />
            <FeatureCard 
              icon={<LayoutDashboard />} 
              title="Planeamento" 
              description="Calendário mensal e semanal com publicação controlada para os jogadores."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-32 max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight">Planos Flexíveis</h2>
          <p className="text-zinc-400">Escolhe o plano que melhor se adapta à dimensão do teu projeto.</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <PricingCard 
            title="Individual"
            price="€19"
            period="/mês"
            description="Para 1 Treinador & 1 Equipa."
            features={['1 Equipa', 'Até 30 Atletas', 'Planeamento Base', 'Questionários PSR']}
          />
          <PricingCard 
            title="Clube Base"
            price="€49"
            period="/mês"
            description="Para clubes com 3 equipas."
            features={['Até 3 Equipas', 'Atletas Ilimitados', 'Acesso Médico', 'Exportação Excel']}
            highlighted
          />
          <PricingCard 
            title="Clube Pro"
            price="€79"
            period="/mês"
            description="Para clubes com 5 equipas."
            features={['Até 5 Equipas', 'Módulos GR & UDIA', 'Suporte Prioritário', 'Análise de Vídeo']}
          />
          <PricingCard 
            title="Clube Elite"
            price="€129"
            period="/mês"
            description="Para clubes até 10 equipas."
            features={['Até 10 Equipas', 'Funcionalidades V3', 'Consultoria Técnica', 'Custom Branding']}
          />
        </div>
      </section>

      {/* Footer Legal */}
      <footer className="bg-black text-white px-8 py-20 mt-20 border-t border-zinc-900">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Trophy size={28} className="text-white" />
              <span className="text-2xl font-black tracking-tighter">CoachOS</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Cumprimos rigorosamente com o RGPD para garantir a segurança dos dados do teu clube e atletas.
            </p>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Legal</h4>
            <ul className="space-y-3 text-zinc-500 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors">Termos de Utilização</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">RGPD & Cookies</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Apoio</h4>
            <p className="text-zinc-500 text-sm">Suporte 24/7 disponível para planos de Clube Pro e Elite.</p>
            <div className="flex gap-4">
              <ShieldCheck className="text-zinc-500" />
              <Globe className="text-zinc-500" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-zinc-900 text-center text-zinc-600 text-xs">
          <p>© 2026 CoachOS. Todos os direitos reservados. Made in Portugal.</p>
        </div>
      </footer>

      {/* Cookie Banner */}
      {showCookies && (
        <div className="fixed bottom-8 right-8 left-8 md:left-auto md:w-[400px] bg-zinc-900 border border-zinc-800 shadow-2xl rounded-3xl p-6 z-100 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex gap-4 items-start">
            <HelpCircle className="text-indigo-500 shrink-0" size={24} />
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Utilizamos cookies para melhorar a tua experiência. Ao continuar, aceitas a nossa política de privacidade.
              </p>
              <button 
                onClick={acceptCookies}
                className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
              >
                Aceitar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ icon, title, description }: any) {
  return (
    <div className="p-10 bg-zinc-900/50 border border-zinc-800 rounded-3xl space-y-6 hover:border-zinc-600 transition-all group">
      <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all text-zinc-400">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, period, description, features, highlighted }: any) {
  return (
    <div className={`p-8 rounded-3xl border ${highlighted ? 'border-white bg-white text-black scale-105' : 'border-zinc-800 bg-zinc-900/50 text-white'} space-y-6 transition-all`}>
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold">{price}</span>
          {period && <span className="text-sm opacity-60">{period}</span>}
        </div>
        <p className={`text-sm ${highlighted ? 'text-zinc-600' : 'text-zinc-500'}`}>{description}</p>
      </div>
      <ul className="space-y-3">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-sm font-bold">
            <Check size={16} className={highlighted ? 'text-black' : 'text-white'} />
            {f}
          </li>
        ))}
      </ul>
      <Link to="/register" className={`w-full block py-3 text-center font-bold rounded-xl transition-all ${highlighted ? 'bg-black text-white hover:opacity-90' : 'bg-white text-black hover:bg-zinc-200'}`}>
        Escolher Plano
      </Link>
    </div>
  )
}
