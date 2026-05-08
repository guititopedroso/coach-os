import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth } from './lib/firebase/client'

// Componentes Públicos
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'

// Dashboard & Layout
import Dashboard from './pages/Dashboard'
import Layout from './components/layout/Layout'

// Workspace Clube
import Seasons from './pages/clube/Seasons'
import Teams from './pages/clube/Teams'
import Access from './pages/clube/Access'

// Workspace Equipa
import Planning from './pages/equipa/Planning'
import Squad from './pages/equipa/Squad'
import Analytics from './pages/equipa/Analytics'
import SessionDetail from './pages/equipa/SessionDetail'

// Workspace Jogador
import Questionnaire from './pages/jogador/Questionnaire'

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
        
        {/* Autenticação */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Rotas Protegidas */}
        <Route element={user ? <Layout /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Workspace Clube */}
          <Route path="/clube/epocas" element={<Seasons />} />
          <Route path="/clube/equipas" element={<Teams />} />
          <Route path="/clube/acessos" element={<Access />} />

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
