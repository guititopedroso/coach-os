import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "O que é o CoachOS?",
    answer: "O CoachOS é uma plataforma SaaS (Software as a Service) desenvolvida especificamente para a digitalização e gestão integrada de clubes desportivos de formação. Permite gerir treinadores, plantéis, avaliações, planos de treino e muito mais num único ecossistema centralizado."
  },
  {
    question: "O CoachOS é adequado para o meu clube?",
    answer: "Sim! A nossa plataforma foi desenhada de forma modular para se adaptar a clubes de diferentes dimensões. Quer sejas um pequeno clube local ou uma grande academia com múltiplas equipas e escalões, o CoachOS adapta-se à tua realidade."
  },
  {
    question: "Preciso de instalar algum software?",
    answer: "Não. O CoachOS é 100% web-based (na cloud). Podes aceder a partir de qualquer dispositivo com ligação à internet e um navegador (computador, tablet ou smartphone), sem necessidade de instalações ou servidores locais."
  },
  {
    question: "Como funciona o período de demonstração?",
    answer: "Após preencheres o pedido de demonstração, a nossa equipa entrará em contacto contigo para configurar um ambiente de teste gratuito e personalizado para a tua realidade. Durante a demonstração terás acesso às funcionalidades principais da plataforma."
  },
  {
    question: "Os dados do meu clube estão seguros?",
    answer: "A segurança é a nossa prioridade. Utilizamos bases de dados encriptadas (PostgreSQL e Firebase), proteção avançada contra acessos indevidos e garantimos conformidade com os regulamentos de proteção de dados (RGPD)."
  },
  {
    question: "Posso cancelar a minha subscrição a qualquer momento?",
    answer: "Sim, os nossos planos não exigem fidelização forçada. Podes cancelar ou alterar o plano a qualquer momento, e a mudança entrará em vigor no final do período de faturação atual."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-600 selection:text-white pb-32">
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
            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter italic">FAQ</h1>
            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">Perguntas Frequentes</p>
          </header>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-20 max-w-3xl mx-auto px-6 -mt-20">
        <div className="bg-white rounded-[40px] shadow-2xl shadow-black/5 border border-slate-100 p-8 md:p-12 space-y-4">
          
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div 
                key={idx} 
                className={`border rounded-3xl transition-all duration-300 ${isOpen ? 'border-blue-600 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-300'}`}
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-black text-lg ${isOpen ? 'text-blue-600' : 'text-slate-900'}`}>
                    {faq.question}
                  </span>
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-100 text-slate-500'}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="px-6 pb-6 pt-2 text-slate-600 font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            )
          })}
          
        </div>
        
        <div className="mt-12 text-center space-y-4">
          <p className="text-slate-500 font-medium">Ainda tens dúvidas?</p>
          <a 
            href="mailto:suporte@coach-os.pt" 
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
          >
            Contactar Suporte
          </a>
        </div>
      </div>
    </div>
  )
}
