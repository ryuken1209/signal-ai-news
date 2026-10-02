import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Home from './pages/Home'
import Article from './pages/Article'
import Login from './pages/Login'
import ForYou from './pages/ForYou'
import Saved from './pages/Saved'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import History from './pages/History'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Toast from './components/ui/Toast'

function App() {
  return (
    <AuthProvider>
      <div className="relative min-h-screen bg-ink text-text-primary selection:bg-signal/30 selection:text-text-primary overflow-x-hidden">
        {/* Ambient atmospheric layers, editorial film grain & technical texture */}
        <div className="ambient-cyan-primary" aria-hidden="true" />
        <div className="ambient-amber-secondary" aria-hidden="true" />
        <div className="ambient-diffusion-center" aria-hidden="true" />
        <div className="technical-grid-layer" aria-hidden="true" />
        <div className="editorial-grain" aria-hidden="true" />
        <div className="vignette-layer" aria-hidden="true" />

        {/* Foreground Content */}
        <div className="relative z-10 flex flex-col min-h-screen">
          <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/for-you" element={<ForYou />} />
          <Route path="/article/:id" element={<Article />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Member Routes */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Collections />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections/:id"
            element={
              <ProtectedRoute>
                <CollectionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toast />
      </BrowserRouter>
        </div>
      </div>
    </AuthProvider>
  )
}

export default App
