import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase/client'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  LogOut, 
  Menu, 
  ClipboardCheck, 
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bell
} from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="flex h-screen bg-zinc-50 text-zinc-900 font-sans overflow-hidden">
      {/* Sidebar Premium Clara */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} border-r border-zinc-200 bg-white transition-all duration-500 flex flex-col shadow-sm z-50`}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-2 group ${!sidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-indigo-900 rounded-lg flex items-center justify-center text-white">
              <Trophy size={18} />
            </div>
            <span className="font-black text-xl tracking-tighter text-indigo-950">CoachOS</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-400">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <div className={`px-4 py-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Geral
          </div>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" open={sidebarOpen} active={isActive('/dashboard')} />
          
          <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Workspace Clube
          </div>
          <NavLink to="/clube/epocas" icon={<Trophy size={20} />} label="Épocas" open={sidebarOpen} active={isActive('/clube/epocas')} />
          <NavLink to="/clube/equipas" icon={<Users size={20} />} label="Equipas" open={sidebarOpen} active={isActive('/clube/equipas')} />
          <NavLink to="/clube/acessos" icon={<ClipboardCheck size={20} />} label="Controlo de Acessos" open={sidebarOpen} active={isActive('/clube/acessos')} />

          <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Equipa Técnica
          </div>
          <NavLink to="/equipa/planeamento" icon={<LayoutDashboard size={20} />} label="Planeamento" open={sidebarOpen} active={isActive('/equipa/planeamento')} />
          <NavLink to="/equipa/plantel" icon={<Users size={20} />} label="Gestão de Plantel" open={sidebarOpen} active={isActive('/equipa/plantel')} />
          <NavLink to="/equipa/analise" icon={<TrendingUp size={20} />} label="Análise de Dados" open={sidebarOpen} active={isActive('/equipa/analise')} />
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-2">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Barra */}
        <header className="h-20 bg-white border-b border-zinc-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
             {/* Breadcrumbs ou Status seriam aqui */}
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-zinc-900 leading-none">{auth.currentUser?.displayName || 'Treinador Principal'}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight mt-1">Admin Clube</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center font-black text-indigo-900">
                {auth.currentUser?.displayName?.[0] || 'T'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-zinc-50/50 p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

function NavLink({ to, icon, label, open, active }: { to: string, icon: any, label: string, open: boolean, active: boolean }) {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
        active 
          ? 'bg-indigo-900 text-white shadow-lg shadow-indigo-100' 
          : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
      }`}
    >
      <div className={active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-900'}>
        {icon}
      </div>
      {open && <span className="truncate">{label}</span>}
    </Link>
  )
}
