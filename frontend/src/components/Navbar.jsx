import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FileText, History, LogOut } from 'lucide-react'

export default function Navbar() {
    const { logout, isAuthenticated } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) return null

    const isActive = (path) => location.pathname === path

    return (
        <nav className="glass-strong sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 no-underline">
                        <img src="/refactorai_logo_name.png" alt="Refactor AI" className="h-10 object-contain" />
                        
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center gap-1">
                        <Link
                            to="/"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline ${isActive('/')
                                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
                                }`}
                        >
                            <FileText className="w-4 h-4" />
                            <span className="hidden sm:inline">Workspace</span>
                        </Link>

                        <Link
                            to="/history"
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all no-underline ${isActive('/history')
                                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary-light)]'
                                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5'
                                }`}
                        >
                            <History className="w-4 h-4" />
                            <span className="hidden sm:inline">History</span>
                        </Link>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-all cursor-pointer bg-transparent border-none"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}
