import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import EpisodeRecapPage from './pages/EpisodeRecapPage/EpisodeRecapPage'
import ScoreEntryPage from './pages/ScoreEntryPage/ScoreEntryPage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p>Loading...</p>
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />

  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<CreateUserPage />} />
      <Route path="/" element={<SeasonsPage />} />
      <Route
        path="/contestants/:seasonNumber"
        element={
          <RequireAuth>
            <PicksPage />
          </RequireAuth>
        }
      />
      <Route path="/scores/:seasonNumber" element={<ScoresPage />} />
      <Route path="/scores/:seasonNumber/episodes/:episodeNumber" element={<EpisodeRecapPage />} />
      <Route
        path="/scores/:seasonNumber/entry/:episodeNumber"
        element={
          <RequireAuth>
            <ScoreEntryPage />
          </RequireAuth>
        }
      />
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
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
