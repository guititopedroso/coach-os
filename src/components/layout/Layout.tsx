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
    <div className="flex h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Sidebar Escura Premium */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} border-r border-zinc-900 bg-zinc-950 transition-all duration-300 flex flex-col shadow-2xl z-50`}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-2 ${!sidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-black">
              <Trophy size={18} />
            </div>
            <span className="font-black text-xl tracking-tighter">CoachOS</span>
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-zinc-900 rounded-xl transition-colors text-zinc-500">
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className={`px-4 py-3 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Plataforma
          </div>
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" open={sidebarOpen} active={isActive('/dashboard')} />
          
          <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Clube
          </div>
          <NavLink to="/clube/epocas" icon={<Trophy size={20} />} label="Épocas" open={sidebarOpen} active={isActive('/clube/epocas')} />
          <NavLink to="/clube/equipas" icon={<Users size={20} />} label="Equipas" open={sidebarOpen} active={isActive('/clube/equipas')} />
          <NavLink to="/clube/acessos" icon={<ClipboardCheck size={20} />} label="Acessos" open={sidebarOpen} active={isActive('/clube/acessos')} />

          <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Equipa Técnica
          </div>
          <NavLink to="/equipa/planeamento" icon={<LayoutDashboard size={20} />} label="Planeamento" open={sidebarOpen} active={isActive('/equipa/planeamento')} />
          <NavLink to="/equipa/plantel" icon={<Users size={20} />} label="Plantel" open={sidebarOpen} active={isActive('/equipa/plantel')} />
          <NavLink to="/equipa/analise" icon={<TrendingUp size={20} />} label="Análise" open={sidebarOpen} active={isActive('/equipa/analise')} />
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-xl transition-all font-bold text-sm"
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4"></div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-zinc-500 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-zinc-900">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{auth.currentUser?.displayName || 'Coach Demo'}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-1">Admin Clube</p>
              </div>
              <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center font-black text-white">
                {auth.currentUser?.displayName?.[0] || 'C'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
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
          ? 'bg-white text-black shadow-lg' 
          : 'text-zinc-500 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      <div className={active ? 'text-black' : 'text-zinc-500'}>
        {icon}
      </div>
      {open && <span className="truncate">{label}</span>}
    </Link>
  )
}
