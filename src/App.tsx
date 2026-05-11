import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase/client'

// Componentes Públicos
import LandingPage from './pages/LandingPage.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Terms from './pages/Terms.tsx'
import Privacy from './pages/Privacy.tsx'
import FAQ from './pages/FAQ.tsx'

// Dashboard & Layout
import Dashboard from './pages/Dashboard.tsx'
import Layout from './components/layout/Layout.tsx'

// Workspace Clube
import Seasons from './pages/clube/Seasons.tsx'
import Teams from './pages/clube/Teams.tsx'
import Access from './pages/clube/Access.tsx'
import ClubProfile from './pages/clube/Profile.tsx'

// Workspace Equipa
import Planning from './pages/equipa/Planning.tsx'
import Squad from './pages/equipa/Squad.tsx'
import Analytics from './pages/equipa/Analytics.tsx'
import SessionDetail from './pages/equipa/SessionDetail.tsx'

// Workspace Jogador
import Questionnaire from './pages/jogador/Questionnaire.tsx'

// Auth & Security
import ForcePasswordChange from './pages/auth/ForcePasswordChange.tsx'
import RegisterClub from './pages/RegisterClub.tsx'
import DemoSeeder from './pages/DemoSeeder.tsx'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-white font-sans font-bold animate-pulse">CoachOS</div>


  return (
    <Router>
      <Routes>
        {/* Rota Pública Inicial */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/demo-setup" element={<DemoSeeder />} />
        
        {/* Autenticação */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register-club" element={!user ? <RegisterClub /> : <Navigate to="/dashboard" />} />
        <Route path="/force-password-change" element={user ? <ForcePasswordChange /> : <Navigate to="/login" />} />
        
        {/* Workspace Protegido */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Workspace Clube */}
          <Route path="/clube/epocas" element={<Seasons />} />
          <Route path="/clube/equipas" element={<Teams />} />
          <Route path="/clube/acessos" element={<Access />} />
          <Route path="/clube/perfil" element={<ClubProfile />} />

          {/* Workspace Equipa */}
          <Route path="/equipa/planeamento" element={<Planning />} />
          <Route path="/equipa/plantel" element={<Squad />} />
          <Route path="/equipa/analise" element={<Analytics />} />
          <Route path="/equipa/sessao/:id" element={<SessionDetail />} />

          {/* Workspace Comum/Jogador */}
          <Route path="/questionario" element={<Questionnaire />} />
        </Route>

        {/* Catch All */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}
