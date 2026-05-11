import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth, db } from '../../lib/firebase/client'
import { doc, getDoc } from 'firebase/firestore'
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  LogOut, 
  Menu, 
  ClipboardCheck, 
  TrendingUp,
  ChevronLeft,
  Bell,
  Settings
} from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    fetchUserRole()
  }, [])

  const fetchUserRole = async () => {
    const user = auth.currentUser
    if (user) {
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      if (userSnap.exists()) {
        const userData = userSnap.data()
        if (userData.mustChangePassword && location.pathname !== '/force-password-change') {
          navigate('/force-password-change')
          return
        }
        setUserRole(userData.role || 'staff')
      } else {
        // Fallback para dev
        setUserRole(localStorage.getItem('user_role') || 'admin_clube')
      }
    }
  }

  const handleLogout = async () => {
    await signOut(auth)
    localStorage.removeItem('user_role')
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path

  const isAdmin = userRole === 'admin_clube'

  return (
    <div className="flex h-screen relative bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Background App */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1518605368461-1b76cb5fe493?auto=format&fit=crop&q=80" 
          alt="App Background" 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-linear-to-tr from-zinc-950 via-zinc-950/90 to-blue-950/20"></div>
      </div>

      {/* Sidebar Inteligente */}
      <aside className={`relative z-50 ${sidebarOpen ? 'w-72' : 'w-20'} border-r border-white/5 bg-zinc-950/50 backdrop-blur-2xl transition-all duration-300 flex flex-col shadow-2xl shadow-black/50`}>
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
          
          {/* SECÇÃO COORDENAÇÃO - Só visível para Admin */}
          {isAdmin && (
            <>
              <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
                Coordenação
              </div>
              <NavLink to="/clube/perfil" icon={<Settings size={20} />} label="Perfil do Clube" open={sidebarOpen} active={isActive('/clube/perfil')} />
              <NavLink to="/clube/epocas" icon={<Trophy size={20} />} label="Épocas" open={sidebarOpen} active={isActive('/clube/epocas')} />
              <NavLink to="/clube/equipas" icon={<Users size={20} />} label="Equipas" open={sidebarOpen} active={isActive('/clube/equipas')} />
              <NavLink to="/clube/acessos" icon={<ClipboardCheck size={20} />} label="Logins & Acessos" open={sidebarOpen} active={isActive('/clube/acessos')} />
            </>
          )}

          {/* SECÇÃO TÉCNICA - Visível para Admin e Staff */}
          <div className={`pt-6 pb-3 px-4 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] ${!sidebarOpen && 'hidden'}`}>
            Treino & Plantel
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
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-20 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 backdrop-blur-sm">
              {isAdmin ? 'Acesso Total' : 'Acesso Técnico'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-zinc-950"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-white leading-none">{auth.currentUser?.displayName || 'Utilizador'}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tight mt-1">{isAdmin ? 'Coordenação' : 'Equipa Técnica'}</p>
              </div>
              <div className="w-10 h-10 bg-linear-to-tr from-blue-600 to-indigo-500 shadow-lg shadow-blue-500/20 rounded-xl flex items-center justify-center font-black text-white">
                {auth.currentUser?.displayName?.[0] || 'U'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
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
          ? 'bg-white text-black shadow-lg shadow-white/10' 
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
