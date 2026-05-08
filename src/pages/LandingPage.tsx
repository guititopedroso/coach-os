import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Trophy, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Stethoscope, 
  Target, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Plus,
  Play,
  LayoutDashboard,
  BarChart3,
  FileText,
  Clock,
  ChevronRight,
  Zap,
  Globe,
  MessageSquare
} from 'lucide-react'

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Navigation - Dynamic background on scroll */}
      <nav className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              scrolled ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-600'
            }`}>
              <Trophy size={22} />
            </div>
            <span className={`text-2xl font-black tracking-tighter transition-colors ${
              scrolled ? 'text-slate-900' : 'text-white'
            }`}>CoachOS</span>
          </div>

          <div className={`hidden lg:flex items-center gap-10 text-sm font-bold ${
            scrolled ? 'text-slate-500' : 'text-white/80'
          }`}>
            <a href="#sobre" className="hover:text-blue-600 transition-colors">O que é</a>
            <a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a>
            <a href="#workspaces" className="hover:text-blue-600 transition-colors">Workspaces</a>
            <a href="#precos" className="hover:text-blue-600 transition-colors">Planos</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className={`hidden sm:block text-sm font-bold px-4 transition-colors ${
              scrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/90 hover:text-white'
            }`}>Entrar</Link>
            <button 
              onClick={() => setIsDemoModalOpen(true)}
              className={`px-6 py-3 text-sm font-black rounded-xl transition-all active:scale-95 ${
                scrolled 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              Pedir Demonstração
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <header className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
        {/* Video BG with Overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            autoPlay loop muted playsInline 
            className="w-full h-full object-cover scale-105"
            poster="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80"
          >
            <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27dc2699a70127203d14227af9363a9c6760ad0&profile_id=164" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black uppercase tracking-[0.3em] text-white">
            <Zap size={14} className="text-blue-400 fill-blue-400" /> A Evolução do Treino
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white italic">
            A plataforma <br />operacional do <br /><span className="text-blue-400 underline decoration-blue-400/30">teu clube.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-white/70 font-medium leading-relaxed">
            Equipas, atletas, planeamento e departamentos. <br className="hidden md:block" />
            Um sistema simples, moderno e desenhado para vencer.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center pt-6">
            <button onClick={() => setIsDemoModalOpen(true)} className="px-12 py-6 bg-blue-600 text-white text-lg font-black rounded-2xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 group">
              Pedir Demonstração <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="#precos" className="px-12 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-lg font-black rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center active:scale-95">
              Ver Planos de Clube
            </a>
          </div>

          <div className="pt-12 animate-bounce">
            <div className="w-1 h-12 bg-linear-to-b from-blue-500 to-transparent mx-auto rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Secção: O que é o CoachOS */}
      <section id="sobre" className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <h3 className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Transformação Digital</h3>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 leading-[0.95]">
                Diz adeus ao <br/><span className="text-slate-300">Caos Operacional.</span>
              </h2>
            </div>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Sabemos que geres o teu clube entre grupos de WhatsApp e ficheiros Excel obsoletos. O CoachOS centraliza tudo num hub único, onde os dados são reais e as decisões são baseadas em factos.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              <CheckItem text="Centralização Total" />
              <CheckItem text="Acesso em Tempo Real" />
              <CheckItem text="Relatórios Automáticos" />
              <CheckItem text="Sem Perda de Dados" />
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[56px] blur-2xl group-hover:bg-blue-600/10 transition-all duration-1000"></div>
            <div className="relative p-12 bg-slate-50 border border-slate-100 rounded-[48px] shadow-premium space-y-8">
               <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-blue-600">
                  <LayoutDashboard size={40} />
               </div>
               <div className="space-y-2">
                 <div className="text-2xl font-black text-slate-900">Dashboard de Coordenação</div>
                 <p className="text-slate-500 font-medium">Vê o estado de todas as equipas num só ecrã. Presenças, exames médicos e planeamento em tempo real.</p>
               </div>
               <div className="flex gap-2">
                 <div className="h-2 w-1/2 bg-blue-600 rounded-full"></div>
                 <div className="h-2 w-1/4 bg-blue-200 rounded-full"></div>
                 <div className="h-2 w-1/4 bg-slate-200 rounded-full"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secção: Funcionalidades Core */}
      <section id="funcionalidades" className="py-32 px-6 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Tudo o que precisas <br/>num único sistema.</h2>
            <p className="text-slate-500 text-xl font-medium italic">Ferramentas desenhadas para equipas de alto rendimento.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <FeatureCard 
              icon={<Calendar size={32} />}
              title="Planeamento Master"
              desc="Mensal, semanal e macrociclo. Exporta para PDF com um clique e partilha com o staff."
            />
            <FeatureCard 
              icon={<ClipboardCheck size={32} />}
              title="Monitorização PSR/PSE"
              desc="Questionários de bem-estar e carga de treino automáticos. Gráficos de análise instantâneos."
            />
            <FeatureCard 
              icon={<FileText size={32} />}
              title="Convocatórias Pro"
              desc="Modelos para futebol 5 a 11. PDF pronto com assinaturas para coordenação e staff."
            />
          </div>
        </div>
      </section>

      {/* Secção: Workspaces specialized */}
      <section id="workspaces" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <div className="grid lg:grid-cols-2 gap-10 items-end">
             <div className="space-y-4">
               <h3 className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Especialização</h3>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">O clube inteiro <br/><span className="text-slate-300">conectado.</span></h2>
             </div>
             <p className="text-lg text-slate-500 font-medium lg:pb-4">
               Não somos apenas para treinadores. O CoachOS oferece áreas de trabalho específicas para todos os departamentos do teu clube.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <WorkspaceBox title="Coordenação" items={['Gestão de Épocas', 'Acessos Staff', 'Subscrição']} icon={<Trophy />} />
            <WorkspaceBox title="Equipa Técnica" items={['Treinos e Jogos', 'Plantel', 'Analytics']} icon={<Users />} />
            <WorkspaceBox title="Departamento Médico" items={['Ocorrências', 'Estado Clínico', 'Terapias']} icon={<Stethoscope />} />
            <WorkspaceBox title="UDIA" items={['Desenvolvimento Individual', 'Feedback Atleta']} icon={<Target />} />
            <WorkspaceBox title="Treinador de GR" items={['Sessões Específicas', 'Performance GR']} icon={<ShieldCheck />} />
            <WorkspaceBox title="Jogador" items={['Agenda Publicada', 'Self-Questionnaires']} icon={<Clock />} />
          </div>
        </div>
      </section>

      {/* Secção: Benefícios para Clubes */}
      <section className="py-32 px-6 bg-slate-900 text-white rounded-[64px] mx-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-12">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Vantagens que <br/>fazem a diferença.</h2>
              <div className="space-y-8">
                 <BenefitItem title="Poupança de Tempo" desc="Reduz em 70% o tempo gasto em burocracia desportiva." />
                 <BenefitItem title="Decisão Baseada em Dados" desc="Deixa de adivinhar. Sabe exatamente como os teus atletas se sentem." />
                 <BenefitItem title="Profissionalismo" desc="Eleva a imagem do teu clube com PDFs e relatórios de excelência." />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6 pt-12">
                 <StatBox value="+80%" label="Eficiência" />
                 <StatBox value="24/7" label="Disponível" />
              </div>
              <div className="space-y-6">
                 <StatBox value="0" label="Caos" />
                 <StatBox value="100%" label="Privacidade" />
              </div>
           </div>
        </div>
      </section>

      {/* Secção: Planos / Comercial */}
      <section id="precos" className="py-40 px-6">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Pronto para começar?</h2>
            <p className="text-slate-500 text-xl font-medium">Escolhe o plano que melhor se adapta à dimensão do teu clube.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PriceCard title="Solo" price="€19" units="1 Equipa" />
            <PriceCard title="Clube Base" price="€49" units="3 Equipas" highlighted />
            <PriceCard title="Clube Pro" price="€89" units="8 Equipas" />
            <PriceCard title="Elite" price="€149" units="15+ Equipas" />
          </div>

          <div className="p-12 bg-blue-50 border border-blue-100 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="space-y-2">
                <div className="text-blue-600 font-black uppercase text-xs tracking-widest">Aumenta o Poder</div>
                <h3 className="text-2xl font-black text-slate-900">Add-on Gestão Administrativa</h3>
                <p className="text-slate-500 font-medium">Mensalidades, pagamentos e planeamento financeiro consolidado.</p>
             </div>
             <div className="text-center md:text-right space-y-4">
                <div className="text-4xl font-black text-slate-900">+15€<span className="text-sm text-slate-400">/mês</span></div>
                <button onClick={() => setIsDemoModalOpen(true)} className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                  Adicionar ao Plano
                </button>
             </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 px-6 bg-blue-600 text-white text-center">
         <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic">Leva o teu clube <br/>ao próximo nível.</h2>
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <button onClick={() => setIsDemoModalOpen(true)} className="px-12 py-6 bg-white text-blue-600 text-xl font-black rounded-2xl hover:bg-blue-50 transition-all shadow-2xl active:scale-95">
                Pedir Demonstração Gratuita
              </button>
              <button onClick={() => setIsDemoModalOpen(true)} className="px-12 py-6 bg-blue-700 text-white text-xl font-black rounded-2xl hover:bg-blue-800 transition-all active:scale-95">
                Pedir Orçamento
              </button>
            </div>
            <p className="text-blue-200 font-bold uppercase tracking-widest text-xs">Resposta em menos de 24 horas</p>
         </div>
      </section>

      {/* Footer Simples & Elegante */}
      <footer className="py-20 px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-blue-600" size={28} />
              <span className="text-2xl font-black tracking-tighter">CoachOS</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed italic">
              Digitalizando o desporto de formação, <br/>um clube de cada vez.
            </p>
          </div>
          <div className="space-y-6">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Produto</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#sobre" className="hover:text-blue-600">O que resolve</a></li>
                <li><a href="#funcionalidades" className="hover:text-blue-600">Funcionalidades</a></li>
                <li><a href="#workspaces" className="hover:text-blue-600">Áreas do Clube</a></li>
             </ul>
          </div>
          <div className="space-y-6">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Apoio</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#" className="hover:text-blue-600">Demonstração</a></li>
                <li><a href="#" className="hover:text-blue-600">Contactar Suporte</a></li>
                <li><a href="#" className="hover:text-blue-600">FAQ</a></li>
             </ul>
          </div>
          <div className="space-y-6">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Legal</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="/terms" className="hover:text-blue-600">Termos e Condições</a></li>
                <li><a href="/privacy" className="hover:text-blue-600">Política de Privacidade</a></li>
             </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-slate-50 text-center flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.3em]">© 2026 CoachOS • Made in Portugal</div>
           <div className="flex gap-6 text-slate-400">
              <Globe size={18} className="hover:text-blue-600 cursor-pointer" />
              <MessageSquare size={18} className="hover:text-blue-600 cursor-pointer" />
           </div>
        </div>
      </footer>

      {/* Modal de Demo - Reutilizado do anterior */}
      {isDemoModalOpen && (
        <DemoModal onClose={() => setIsDemoModalOpen(false)} />
      )}
    </div>
  )
}

/* Sub-componentes para manter o ficheiro limpo e premium */

function CheckItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 font-bold text-slate-700">
      <div className="w-6 h-6 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
        <Check size={14} />
      </div>
      {text}
    </div>
  )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-12 bg-white border border-slate-100 rounded-[48px] space-y-8 hover:shadow-premium transition-all hover:scale-[1.02] duration-500 group">
      <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-4">
        <h4 className="text-2xl font-black text-slate-900 leading-tight">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}

function WorkspaceBox({ title, items, icon }: any) {
  return (
    <div className="p-10 bg-white border border-slate-100 rounded-[40px] space-y-8 hover:border-blue-200 transition-all group">
      <div className="flex items-center justify-between">
         <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
           {icon}
         </div>
         <Plus size={20} className="text-slate-200 group-hover:text-blue-200 transition-all" />
      </div>
      <div className="space-y-6">
        <h4 className="text-xl font-black text-slate-900">{title}</h4>
        <ul className="space-y-3">
          {items.map((item: string) => (
            <li key={item} className="flex items-center gap-3 text-sm font-bold text-slate-500">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div> {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function BenefitItem({ title, desc }: any) {
  return (
    <div className="flex gap-6 group">
       <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all">
          <ArrowRight size={24} className="group-hover:-rotate-45 transition-all" />
       </div>
       <div className="space-y-2">
          <h4 className="text-xl font-black">{title}</h4>
          <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </div>
  )
}

function StatBox({ value, label }: any) {
  return (
    <div className="p-8 bg-white/5 border border-white/10 rounded-[32px] text-center space-y-1">
       <div className="text-4xl font-black text-white">{value}</div>
       <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">{label}</div>
    </div>
  )
}

function PriceCard({ title, price, units, highlighted }: any) {
  return (
    <div className={`p-10 rounded-[48px] border-2 transition-all flex flex-col ${
      highlighted ? 'bg-white border-blue-600 scale-110 shadow-2xl z-10' : 'bg-slate-50 border-transparent text-slate-900 opacity-90'
    }`}>
      <div className="text-center space-y-4 flex-1">
         <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
         <div className="text-5xl font-black text-slate-900 tracking-tighter">{price}</div>
         <p className="text-sm font-bold text-slate-500">Por {units}</p>
         <div className="h-px w-12 bg-slate-200 mx-auto my-6"></div>
         <ul className="space-y-4 text-left">
            <PriceItem text="Planeamento Completo" />
            <PriceItem text="Analytics & Dashboards" />
            <PriceItem text="Exportação PDF" />
            {highlighted && <PriceItem text="Suporte Premium" />}
         </ul>
      </div>
      <button onClick={() => window.location.href='mailto:demo@coach-os.pt'} className={`w-full py-5 mt-10 font-black rounded-2xl transition-all ${
        highlighted ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-slate-200 hover:bg-slate-100'
      }`}>
        Pedir Orçamento
      </button>
    </div>
  )
}

function PriceItem({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-xs font-bold text-slate-600">
      <Check size={14} className="text-emerald-500" /> {text}
    </li>
  )
}

function DemoModal({ onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-200 flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl p-12 space-y-10 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-full">
           <Plus className="rotate-45" size={24} />
        </button>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
             <Play size={24} fill="currentColor" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 italic underline decoration-blue-600/20">Pedir Demonstração</h3>
          <p className="text-slate-500 font-medium">Conta-nos um pouco sobre o teu clube e entraremos em contacto.</p>
        </div>

        <form className="grid md:grid-cols-2 gap-6" onSubmit={(e) => e.preventDefault()}>
          <ModalInput label="Nome Completo" placeholder="Ex: António Silva" />
          <ModalInput label="Cargo" placeholder="Ex: Coordenador" />
          <ModalInput label="Nome do Clube" placeholder="Ex: G.D. Estoril" />
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nº Equipas</label>
            <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
              <option>1-3 Equipas</option>
              <option>4-8 Equipas</option>
              <option>9-15 Equipas</option>
              <option>15+ Equipas</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-1.5">
             <ModalInput label="Email Profissional" placeholder="email@clube.pt" />
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notas Adicionais</label>
            <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-24" placeholder="Alguma necessidade específica?"></textarea>
          </div>
          <button className="md:col-span-2 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95">
            Enviar Pedido de Demo
          </button>
        </form>
      </div>
    </div>
  )
}

function ModalInput({ label, placeholder }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <input type="text" placeholder={placeholder} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-200 transition-all" />
    </div>
  )
}
