import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import LoginPage from './pages/LoginPage/LoginPage'
import CreateUserPage from './pages/CreateUserPage/CreateUserPage'
import SeasonsPage from './pages/SeasonsPage/SeasonsPage'
import PicksPage from './pages/PicksPage/PicksPage'
import RulesPage from './pages/RulesPage/RulesPage'
import ScoresPage from './pages/ScoresPage/ScoresPage'

function AuthGate() {
  const { user, loading } = useAuth()
  const [view, setView] = useState('login')

  if (loading) return <p>Loading...</p>

  if (!user) {
    return view === 'login' ? (
      <LoginPage onSwitchToSignup={() => setView('signup')} />
    ) : (
      <CreateUserPage onSwitchToLogin={() => setView('login')} />
    )
  }

  return (
    <Routes>
      <Route path="/" element={<SeasonsPage />} />
      <Route path="/contestants/:seasonNumber" element={<PicksPage />} />
      <Route path="/scores/:seasonNumber" element={<ScoresPage />} />
      <Route path="/rules" element={<RulesPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ThemeToggle />
          <AuthGate />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
