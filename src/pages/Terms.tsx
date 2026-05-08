import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans p-8 md:p-20 selection:bg-white selection:text-black">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link to="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Voltar à página inicial
        </Link>

        <header className="space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Termos e Condições</h1>
          <p className="text-zinc-500">Última atualização: Maio de 2026</p>
        </header>

        <section className="space-y-8 text-zinc-400 leading-relaxed">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">1. Aceitação dos Termos</h2>
            <p>Ao aceder ao CoachOS, o utilizador concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis. Se não concordar com algum destes termos, está proibido de usar ou aceder a este site.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">2. Licença de Uso</h2>
            <p>É concedida permissão para aceder temporariamente aos recursos do CoachOS apenas para uso pessoal ou profissional dentro do contexto de treino desportivo. Esta é a concessão de uma licença, não uma transferência de título.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">3. Isenção de Responsabilidade</h2>
            <p>Os materiais no CoachOS são fornecidos 'como estão'. O CoachOS não oferece garantias, expressas ou implícitas, e por este meio isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização.</p>
          </div>
        </section>

        <footer className="pt-12 border-t border-zinc-900 text-sm text-zinc-600">
          © 2026 CoachOS. Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
