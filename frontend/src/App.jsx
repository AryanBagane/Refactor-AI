import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Sidebar from './components/Sidebar'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import Workspace from './components/Workspace'
import HistoryPage from './components/HistoryPage'
import ProtectedRoute from './components/ProtectedRoute'

function AppShell({ children }) {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="app-content">
                {children}
            </main>
        </div>
    )
}

export default function App() {
    const { isAuthenticated } = useAuth()

    // Auth pages — full screen, no sidebar
    if (!isAuthenticated) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        )
    }

    // Authenticated pages — sidebar + content
    return (
        <AppShell>
            <Routes>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Workspace />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppShell>
    )
}
