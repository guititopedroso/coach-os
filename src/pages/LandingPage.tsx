import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase/client'
import { motion, AnimatePresence } from 'framer-motion'
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

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: "easeOut" }
}

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function LandingPage() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  
  // Lead Form State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Coordenação',
    club: '',
    teams: '1',
    email: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, 'leads'), {
        ...formData,
        status: 'pendente',
        createdAt: new Date()
      })
      setIsSuccess(true)
      setTimeout(() => {
        setIsDemoModalOpen(false)
        setIsSuccess(false)
        setFormData({ name: '', role: 'Coordenação', club: '', teams: '1', email: '', notes: '' })
      }, 3000)
    } catch (err) {
      console.error('Erro ao enviar lead:', err)
      alert('Erro ao enviar pedido. Tenta novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-100 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-xl border-b border-slate-100 py-4 shadow-sm' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              scrolled ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-blue-600'
            }`}>
              <Trophy size={22} />
            </div>
            <span className={`text-2xl font-black tracking-tighter transition-colors ${
              scrolled ? 'text-slate-900' : 'text-white'
            }`}>CoachOS</span>
          </motion.div>

          <div className={`hidden lg:flex items-center gap-10 text-sm font-bold ${
            scrolled ? 'text-slate-500' : 'text-white/80'
          }`}>
            {['Sobre', 'Funcionalidades', 'Workspaces', 'Planos'].map((item, i) => (
              <motion.a 
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href={`#${item.toLowerCase().replace(' ', '-')}`} 
                className="hover:text-blue-600 transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/login" className={`hidden sm:block text-sm font-bold px-4 transition-colors ${
              scrolled ? 'text-slate-600 hover:text-blue-600' : 'text-white/90 hover:text-white'
            }`}>Entrar</Link>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDemoModalOpen(true)}
              className={`px-6 py-3 text-sm font-black rounded-xl transition-all ${
                scrolled 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              Pedir Demonstração
            </motion.button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
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

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-black uppercase tracking-[0.3em] text-white"
          >
            <Zap size={14} className="text-blue-400 fill-blue-400" /> A Evolução do Treino
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-white italic"
          >
            A plataforma <br />operacional do <br /><span className="text-blue-400 underline decoration-blue-400/30">teu clube.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-2xl mx-auto text-xl md:text-2xl text-white/70 font-medium leading-relaxed"
          >
            Equipas, atletas, planeamento e departamentos. <br className="hidden md:block" />
            Um sistema simples, moderno e desenhado para vencer.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-5 justify-center pt-6"
          >
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(37, 99, 235, 0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDemoModalOpen(true)} 
              className="px-12 py-6 bg-blue-600 text-white text-lg font-black rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              Pedir Demonstração <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.a 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: 0.95 }}
              href="#planos" 
              className="px-12 py-6 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-lg font-black rounded-2xl transition-all flex items-center justify-center"
            >
              Ver Planos de Clube
            </motion.a>
          </motion.div>
        </div>
      </header>

      {/* Secção: Sobre */}
      <section id="sobre" className="py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            variants={fadeInUp}
            initial="initial"
            whileInView="whileInView"
            className="space-y-10 text-left"
          >
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
              {['Centralização Total', 'Acesso em Tempo Real', 'Relatórios Automáticos', 'Sem Perda de Dados'].map((text) => (
                <CheckItem key={text} text={text} />
              ))}
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1 }}
            className="relative group"
          >
            <div className="absolute -inset-4 bg-blue-600/5 rounded-[56px] blur-2xl group-hover:bg-blue-600/10 transition-all duration-1000"></div>
            <motion.div 
              whileHover={{ y: -10, rotate: 1 }}
              className="relative p-12 bg-slate-50 border border-slate-100 rounded-[48px] shadow-premium space-y-8"
            >
               <motion.div 
                animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg text-blue-600"
               >
                  <LayoutDashboard size={40} />
               </motion.div>
               <div className="space-y-2 text-left">
                 <div className="text-2xl font-black text-slate-900">Dashboard de Coordenação</div>
                 <p className="text-slate-500 font-medium">Vê o estado de todas as equipas num só ecrã. Presenças, exames médicos e planeamento em tempo real.</p>
               </div>
               <div className="flex gap-2">
                 <motion.div initial={{ width: 0 }} whileInView={{ width: '50%' }} transition={{ duration: 1.5, delay: 0.5 }} className="h-2 bg-blue-600 rounded-full"></motion.div>
                 <motion.div initial={{ width: 0 }} whileInView={{ width: '25%' }} transition={{ duration: 1.5, delay: 0.7 }} className="h-2 bg-blue-200 rounded-full"></motion.div>
                 <motion.div initial={{ width: 0 }} whileInView={{ width: '25%' }} transition={{ duration: 1.5, delay: 0.9 }} className="h-2 bg-slate-200 rounded-full"></motion.div>
               </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Secção: Funcionalidades */}
      <section id="funcionalidades" className="py-32 px-6 bg-slate-50/50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto space-y-24">
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Tudo o que precisas <br/>num único sistema.</h2>
            <p className="text-slate-500 text-xl font-medium italic">Ferramentas desenhadas para equipas de alto rendimento.</p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid md:grid-cols-3 gap-10"
          >
            <FeatureCard icon={<Calendar size={32} />} title="Planeamento Master" desc="Mensal, semanal e macrociclo. Exporta para PDF com um clique e partilha com o staff." />
            <FeatureCard icon={<ClipboardCheck size={32} />} title="Monitorização PSR/PSE" desc="Questionários de bem-estar e carga de treino automáticos. Gráficos de análise instantâneos." />
            <FeatureCard icon={<FileText size={32} />} title="Convocatórias Pro" desc="Modelos para futebol 5 a 11. PDF pronto com assinaturas para coordenação e staff." />
          </motion.div>
        </div>
      </section>

      {/* Secção: Workspaces */}
      <section id="workspaces" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="grid lg:grid-cols-2 gap-10 items-end">
             <div className="space-y-4 text-left">
               <h3 className="text-blue-600 font-black uppercase tracking-[0.3em] text-xs">Especialização</h3>
               <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">O clube inteiro <br/><span className="text-slate-300">conectado.</span></h2>
             </div>
             <p className="text-lg text-slate-500 font-medium lg:pb-4 text-left">
               Não somos apenas para treinadores. O CoachOS oferece áreas de trabalho específicas para todos os departamentos do teu clube.
             </p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <WorkspaceBox title="Coordenação" items={['Gestão de Épocas', 'Acessos Staff', 'Subscrição']} icon={<Trophy />} />
            <WorkspaceBox title="Equipa Técnica" items={['Treinos e Jogos', 'Plantel', 'Analytics']} icon={<Users />} />
            <WorkspaceBox title="Departamento Médico" items={['Ocorrências', 'Estado Clínico', 'Terapias']} icon={<Stethoscope />} />
            <WorkspaceBox title="UDIA" items={['Desenvolvimento Individual', 'Feedback Atleta']} icon={<Target />} />
            <WorkspaceBox title="Treinador de GR" items={['Sessões Específicas', 'Performance GR']} icon={<ShieldCheck />} />
            <WorkspaceBox title="Jogador" items={['Agenda Publicada', 'Self-Questionnaires']} icon={<Clock />} />
          </motion.div>
        </div>
      </section>

      {/* Secção: Benefícios */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="py-32 px-6 bg-slate-900 text-white rounded-[64px] mx-6"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
           <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="space-y-12 text-left">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Vantagens que <br/>fazem a diferença.</h2>
              <div className="space-y-8">
                 <BenefitItem title="Poupança de Tempo" desc="Reduz em 70% o tempo gasto em burocracia desportiva." />
                 <BenefitItem title="Decisão Baseada em Dados" desc="Deixa de adivinhar. Sabe exatamente como os teus atletas se sentem." />
                 <BenefitItem title="Profissionalismo" desc="Eleva a imagem do teu clube com PDFs e relatórios de excelência." />
              </div>
           </motion.div>
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
      </motion.section>

      {/* Secção: Preços */}
      <section id="planos" className="py-40 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900">Pronto para começar?</h2>
            <p className="text-slate-500 text-xl font-medium">Escolhe o plano que melhor se adapta à dimensão do teu clube.</p>
          </motion.div>
            
          <motion.div 
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <PriceCard 
              title="Solo" 
              priceMonthly="19" 
              priceYearly="15" 
              units="1 Equipa" 
            />
            <PriceCard 
              title="Clube Base" 
              priceMonthly="49" 
              priceYearly="39" 
              units="3 Equipas" 
              highlighted 
            />
            <PriceCard 
              title="Clube Pro" 
              priceMonthly="89" 
              priceYearly="71" 
              units="8 Equipas" 
            />
            <PriceCard 
              title="Elite" 
              priceMonthly="149" 
              priceYearly="119" 
              units="15+ Equipas" 
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="p-12 bg-blue-50 border border-blue-100 rounded-[48px] flex flex-col md:flex-row items-center justify-between gap-8"
          >
             <div className="space-y-2 text-left">
                <div className="text-blue-600 font-black uppercase text-xs tracking-widest">Aumenta o Poder</div>
                <h3 className="text-2xl font-black text-slate-900">Add-on Gestão Administrativa</h3>
                <p className="text-slate-500 font-medium">Mensalidades, pagamentos e planeamento financeiro consolidado.</p>
             </div>
             <div className="text-center md:text-right space-y-4">
                <div className="text-4xl font-black text-slate-900">+15€<span className="text-sm text-slate-400">/mês</span></div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsDemoModalOpen(true)} 
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100"
                >
                  Adicionar ao Plano
                </motion.button>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Trophy className="text-blue-600" size={28} />
              <span className="text-2xl font-black tracking-tighter">CoachOS</span>
            </div>
            <p className="text-slate-400 font-medium leading-relaxed italic text-left">
              Digitalizando o desporto de formação, <br/>um clube de cada vez.
            </p>
          </div>
          <div className="space-y-6 text-left">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Produto</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><a href="#sobre" className="hover:text-blue-600 transition-colors">O que resolve</a></li>
                <li><a href="#funcionalidades" className="hover:text-blue-600 transition-colors">Funcionalidades</a></li>
                <li><a href="#workspaces" className="hover:text-blue-600 transition-colors">Áreas do Clube</a></li>
             </ul>
          </div>
          <div className="space-y-6 text-left">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Apoio</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><button onClick={() => setIsDemoModalOpen(true)} className="hover:text-blue-600 transition-colors">Demonstração</button></li>
                <li><a href="mailto:suporte@coach-os.pt" className="hover:text-blue-600 transition-colors">Contactar Suporte</a></li>
                <li><Link to="/faq" className="hover:text-blue-600 transition-colors">FAQ</Link></li>
             </ul>
          </div>
          <div className="space-y-6 text-left">
             <h4 className="font-black text-slate-900 uppercase text-xs tracking-[0.2em]">Legal</h4>
             <ul className="space-y-4 text-sm font-bold text-slate-500">
                <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Termos e Condições</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Política de Privacidade</Link></li>
                <li><a href="https://www.livroreclamacoes.pt/Inicio/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Livro de Reclamações</a></li>
                <li><a href="https://livrodeelogios.com/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">Livro de Elogios</a></li>
             </ul>
          </div>
        </div>
      </footer>

      {/* Modal de Demo */}
      <AnimatePresence>
        {isDemoModalOpen && (
          <DemoModal 
            onClose={() => setIsDemoModalOpen(false)} 
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleDemoSubmit}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* Componentes com animação */

function CheckItem({ text }: { text: string }) {
  return (
    <motion.div 
      variants={fadeInUp}
      className="flex items-center gap-3 font-bold text-slate-700"
    >
      <div className="w-6 h-6 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0">
        <Check size={14} />
      </div>
      {text}
    </motion.div>
  )
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ y: -15, boxShadow: '0 40px 80px -15px rgba(0,0,0,0.1)' }}
      className="p-12 bg-white border border-slate-100 rounded-[48px] space-y-8 transition-all duration-500 group text-left"
    >
      <motion.div 
        whileHover={{ rotate: 5, scale: 1.1 }}
        className="w-16 h-16 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500"
      >
        {icon}
      </motion.div>
      <div className="space-y-4">
        <h4 className="text-2xl font-black text-slate-900 leading-tight">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  )
}

function WorkspaceBox({ title, items, icon }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ scale: 1.03, borderColor: '#2563eb' }}
      className="p-10 bg-white border border-slate-100 rounded-[40px] space-y-8 transition-all group text-left"
    >
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
    </motion.div>
  )
}

function BenefitItem({ title, desc }: any) {
  return (
    <motion.div variants={fadeInUp} className="flex gap-6 group text-left">
       <motion.div 
        whileHover={{ rotate: -45, scale: 1.1 }}
        className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all"
       >
          <ArrowRight size={24} />
       </motion.div>
       <div className="space-y-2">
          <h4 className="text-xl font-black">{title}</h4>
          <p className="text-slate-400 font-medium leading-relaxed">{desc}</p>
       </div>
    </motion.div>
  )
}

function StatBox({ value, label }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.5 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 10 }}
      className="p-8 bg-white/5 border border-white/10 rounded-[32px] text-center space-y-1"
    >
       <div className="text-4xl font-black text-white">{value}</div>
       <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">{label}</div>
    </motion.div>
  )
}

function PriceCard({ title, priceMonthly, priceYearly, units, highlighted }: any) {
  return (
    <motion.div 
      variants={fadeInUp}
      whileHover={{ scale: highlighted ? 1.05 : 1.02, y: -5 }}
      className={`p-10 rounded-[48px] border-2 transition-all flex flex-col ${
        highlighted ? 'bg-white border-blue-600 shadow-2xl z-10' : 'bg-slate-50 border-transparent text-slate-900'
      }`}
    >
      <div className="text-center space-y-4 flex-1">
         <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h4>
         
         <div className="space-y-1">
            <div className="text-5xl font-black text-slate-900 tracking-tighter">€{priceMonthly}</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Por mês</p>
         </div>

         <div className="py-3 px-4 bg-emerald-50 rounded-2xl border border-emerald-100">
            <div className="text-emerald-600 font-black text-xl">€{priceYearly} <span className="text-[10px] uppercase">/mês</span></div>
            <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">Faturação Anual (-20%)</p>
         </div>

         <p className="text-sm font-bold text-slate-500 pt-2">Para {units}</p>
         
         <div className="h-px w-12 bg-slate-200 mx-auto my-6"></div>
         <ul className="space-y-4 text-left">
            {['Planeamento Completo', 'Analytics & Dashboards', 'Exportação PDF'].map(t => (
              <li key={t} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                <Check size={14} className="text-emerald-500" /> {t}
              </li>
            ))}
         </ul>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.location.href='mailto:demo@coach-os.pt'} 
        className={`w-full py-5 mt-10 font-black rounded-2xl transition-all ${
          highlighted ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'bg-white border border-slate-200 hover:bg-slate-100'
        }`}
      >
        Pedir Orçamento
      </motion.button>
    </motion.div>
  )
}

function DemoModal({ onClose, formData, setFormData, onSubmit, isSubmitting, isSuccess }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-200 flex items-center justify-center p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-2xl rounded-[48px] shadow-2xl p-12 space-y-10 relative max-h-[90vh] overflow-y-auto text-left"
      >
        <button onClick={onClose} className="absolute top-8 right-8 p-3 text-slate-300 hover:text-slate-900 transition-colors bg-slate-50 rounded-full">
           <Plus className="rotate-45" size={24} />
        </button>

        <div className="text-center space-y-4">
          <motion.div 
            animate={{ scale: isSuccess ? [1, 1.2, 1] : [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto"
          >
             {isSuccess ? <Check className="text-emerald-500" size={32} /> : <Play size={24} fill="currentColor" />}
          </motion.div>
          <h3 className="text-3xl font-black text-slate-900 italic underline decoration-blue-600/20">
            {isSuccess ? 'Pedido Enviado!' : 'Pedir Demonstração'}
          </h3>
          <p className="text-slate-500 font-medium">
            {isSuccess ? 'Entraremos em contacto muito em breve.' : 'Conta-nos um pouco sobre o teu clube e entraremos em contacto.'}
          </p>
        </div>

        {!isSuccess && (
          <form className="grid md:grid-cols-2 gap-6" onSubmit={onSubmit}>
            <ModalInput label="Nome Completo" placeholder="Ex: António Silva" value={formData.name} onChange={(val: string) => setFormData({...formData, name: val})} />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cargo</label>
              <select value={formData.role} onChange={(e: any) => setFormData({...formData, role: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                <option>Coordenação</option>
                <option>Treinador</option>
                <option>Presidente/Direção</option>
                <option>Outro</option>
              </select>
            </div>
            <ModalInput label="Nome do Clube" placeholder="Ex: G.D. Estoril" value={formData.club} onChange={(val: string) => setFormData({...formData, club: val})} />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nº Equipas</label>
              <select value={formData.teams} onChange={(e: any) => setFormData({...formData, teams: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                {[...Array(15)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} {i + 1 === 1 ? 'Equipa' : 'Equipas'}</option>
                ))}
                <option value="15+">15+ Equipas</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
               <ModalInput label="Email Profissional" placeholder="email@clube.pt" value={formData.email} onChange={(val: string) => setFormData({...formData, email: val})} />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Notas Adicionais</label>
              <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm h-24" placeholder="Alguma necessidade específica?"></textarea>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-2 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'A enviar...' : 'Enviar Pedido de Demo'}
            </motion.button>
          </form>
        )}
      </motion.div>
    </motion.div>
  )
}

function ModalInput({ label, placeholder, value, onChange }: any) {
  return (
    <div className="space-y-1.5 text-left">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
      <input type="text" required value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-blue-200 transition-all" />
    </div>
  )
}
