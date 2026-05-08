import { Outlet, Link, useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase/client'
import { LayoutDashboard, Users, Trophy, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden font-sans">
      {/* Sidebar Simples */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} border-right border-zinc-800 bg-zinc-900/50 transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between">
          <span className={`font-bold text-xl ${!sidebarOpen && 'hidden'}`}>CoachOS</span>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-zinc-800 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavLink to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" open={sidebarOpen} />
          <NavLink to="/jogadores" icon={<Users size={20} />} label="Jogadores" open={sidebarOpen} />
          <NavLink to="/equipas" icon={<Trophy size={20} />} label="Equipas" open={sidebarOpen} />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}

function NavLink({ to, icon, label, open }: any) {
  return (
    <Link 
      to={to} 
      className="flex items-center gap-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
    >
      {icon}
      {open && <span className="font-medium">{label}</span>}
    </Link>
  )
}
