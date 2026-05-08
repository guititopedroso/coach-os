import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, Trophy, ClipboardCheck, ArrowRight, Star, Check, HelpCircle, ShieldCheck, Globe, CreditCard } from 'lucide-react'
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
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header / Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-indigo-900 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Trophy className="text-white" size={20} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-indigo-950">CoachOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors">Funcionalidades</a>
          <a href="#pricing" className="text-sm font-semibold text-zinc-500 hover:text-indigo-600 transition-colors">Preços</a>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-indigo-600 transition-colors px-4">Entrar</Link>
          <Link to="/register" className="px-6 py-3 bg-indigo-900 text-white text-sm font-bold rounded-xl hover:bg-indigo-800 transition-all shadow-xl shadow-indigo-100 active:scale-95">
            Começar Agora
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 pt-24 pb-32 max-w-7xl mx-auto text-center space-y-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-600 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Globe size={14} />
          <span>A plataforma líder para clubes de alto rendimento</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] text-indigo-950">
          Gestão Desportiva <br />
          <span className="text-indigo-600 italic">Redefinida.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-xl md:text-2xl text-zinc-500 font-medium leading-relaxed">
          O CoachOS centraliza todos os departamentos do seu clube numa única interface intuitiva e segura. Planeamento, Medicina, e Performance em total harmonia.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
          <Link to="/register" className="w-full sm:w-auto px-10 py-5 bg-indigo-900 text-white text-lg font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-800 transition-all shadow-2xl shadow-indigo-200">
            Solicitar Demonstração <ArrowRight size={22} />
          </Link>
          <a href="#pricing" className="w-full sm:w-auto px-10 py-5 bg-white border-2 border-zinc-100 text-zinc-900 text-lg font-bold rounded-2xl hover:bg-zinc-50 transition-all">
            Ver Planos
          </a>
        </div>
        
        <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale max-w-4xl mx-auto">
          <div className="font-black text-2xl">LIGA PRO</div>
          <div className="font-black text-2xl">ELITE FC</div>
          <div className="font-black text-2xl">GLOBAL SPORTS</div>
          <div className="font-black text-2xl">TECH ACADEMY</div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-6 py-32 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl font-black tracking-tight text-indigo-950">Uma estrutura profissional <br/>ao seu alcance.</h2>
            <p className="text-lg text-zinc-500">Esqueça as folhas de Excel e os processos manuais. O CoachOS digitaliza o seu clube de ponta a ponta.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Users />} 
              title="Workspaces Dedicados" 
              description="Acessos exclusivos para Coordenação, Equipa Técnica, Departamento Médico, GRs e UDIA."
            />
            <FeatureCard 
              icon={<ClipboardCheck />} 
              title="Monitorização em Tempo Real" 
              description="Acompanhe o estado físico e mental dos seus atletas através de questionários PSR e PSE automáticos."
            />
            <FeatureCard 
              icon={<LayoutDashboard />} 
              title="Planeamento Inteligente" 
              description="Gestão de épocas, macrociclos e sessões de treino com publicação controlada para os atletas."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-32 max-w-7xl mx-auto space-y-20">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-indigo-950">Planos de Subscrição</h2>
          <p className="text-lg text-zinc-500">Preços transparentes desenhados para todos os tamanhos de clubes.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <PricingCard 
            title="Starter"
            price="Grátis"
            description="Ideal para treinadores individuais."
            features={['1 Equipa', 'Até 25 Jogadores', 'Planeamento Mensal', 'Questionário PSR Básico']}
          />
          <PricingCard 
            title="Standard"
            price="€49"
            period="/mês"
            description="Perfeito para clubes locais em crescimento."
            features={['Até 5 Equipas', 'Jogadores Ilimitados', 'Módulo Médico Básico', 'Exportação Excel', 'Suporte Via Email']}
            highlighted
          />
          <PricingCard 
            title="Elite"
            price="Sob Consulta"
            description="A solução total para clubes profissionais."
            features={['Equipas Ilimitadas', 'Módulo Médico Completo', 'UDIA & Treino de GRs', 'API de Integração', 'Account Manager Dedicado']}
          />
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="bg-zinc-950 text-white px-8 py-20 mt-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="space-y-6 col-span-2">
            <div className="flex items-center gap-2">
              <Trophy size={28} className="text-indigo-400" />
              <span className="text-2xl font-black tracking-tighter">CoachOS</span>
            </div>
            <p className="text-zinc-400 max-w-sm leading-relaxed">
              O CoachOS é uma plataforma de gestão desportiva que cumpre rigorosamente com o RGPD (Regulamento Geral de Proteção de Dados). Garantimos a segurança e confidencialidade dos dados dos seus atletas.
            </p>
            <div className="flex gap-4 items-center">
              <ShieldCheck className="text-indigo-400" size={24} />
              <span className="text-sm font-bold text-zinc-300 italic">ISO 27001 Compliant Architecture</span>
            </div>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Documentação Legal</h4>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li><Link to="/terms" className="hover:text-white transition-colors underline decoration-zinc-800">Termos de Utilização</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors underline decoration-zinc-800">Política de Privacidade</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors underline decoration-zinc-800">Política de Cookies</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Apoio ao Cliente</h4>
            <ul className="space-y-3 text-zinc-400 text-sm">
              <li>Centro de Ajuda</li>
              <li>Contacto de Suporte</li>
              <li>Email: legal@coach-os.pt</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
          <p>© 2026 CoachOS. Todos os direitos reservados. Made in Portugal.</p>
          <div className="flex gap-8">
            <span>Segurança HTTPS</span>
            <span>RGPD Validado</span>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      {showCookies && (
        <div className="fixed bottom-8 right-8 left-8 md:left-auto md:w-[400px] bg-white border border-zinc-200 shadow-2xl rounded-3xl p-6 z-[100] animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex gap-4 items-start">
            <HelpCircle className="text-indigo-600 shrink-0" size={24} />
            <div className="space-y-4">
              <p className="text-sm text-zinc-600 leading-relaxed">
                Utilizamos cookies para melhorar a sua experiência e garantir a segurança do site. Ao continuar, concorda com a nossa <Link to="/privacy" className="text-indigo-600 font-bold underline">Política de Privacidade</Link>.
              </p>
              <button 
                onClick={acceptCookies}
                className="w-full py-3 bg-indigo-900 text-white font-bold rounded-xl hover:bg-indigo-800 transition-all"
              >
                Aceitar e Continuar
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
    <div className="p-10 bg-white border border-zinc-100 rounded-[32px] space-y-6 hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-100 transition-all group">
      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all text-indigo-600">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-indigo-950">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{description}</p>
    </div>
  )
}

function PricingCard({ title, price, period, description, features, highlighted }: any) {
  return (
    <div className={`p-10 rounded-[40px] border-2 ${highlighted ? 'border-indigo-600 bg-white scale-105 shadow-3xl shadow-indigo-100' : 'border-zinc-50 bg-zinc-50/50 text-zinc-900'} space-y-8 transition-all relative overflow-hidden`}>
      {highlighted && (
        <div className="absolute top-5 right-5 bg-indigo-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">
          Mais Popular
        </div>
      )}
      <div className="space-y-3">
        <h3 className="text-xl font-black text-indigo-950 uppercase tracking-tight">{title}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-5xl font-black text-indigo-950 tracking-tighter">{price}</span>
          {period && <span className="text-lg font-bold text-zinc-400">{period}</span>}
        </div>
        <p className="text-sm font-medium text-zinc-500 leading-relaxed">{description}</p>
      </div>
      <ul className="space-y-4">
        {features.map((f: string) => (
          <li key={f} className="flex items-center gap-3 text-sm font-bold text-zinc-700">
            <Check size={18} className="text-indigo-600" />
            {f}
          </li>
        ))}
      </ul>
      <Link to="/register" className={`w-full block py-4 text-center font-bold rounded-2xl transition-all shadow-lg ${highlighted ? 'bg-indigo-900 text-white hover:bg-indigo-800 shadow-indigo-200' : 'bg-white text-indigo-900 hover:bg-zinc-100 border border-zinc-100'}`}>
        Selecionar Plano
      </Link>
    </div>
  )
}
