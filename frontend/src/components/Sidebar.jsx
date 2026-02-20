import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    Sparkles, FileText, History, LogOut,
    Menu, X, ChevronRight
} from 'lucide-react'

const navItems = [
    { path: '/', label: 'Workspace', icon: FileText },
    { path: '/history', label: 'History', icon: History },
]

export default function Sidebar() {
    const { logout } = useAuth()
    const location = useLocation()
    const [mobileOpen, setMobileOpen] = useState(false)

    const isActive = (path) => location.pathname === path

    return (
        <>
            {/* Mobile toggle button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="sidebar-mobile-toggle"
                aria-label="Open menu"
            >
                <Menu style={{ width: 22, height: 22 }} />
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
                {/* Close button (mobile only) */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="sidebar-close-btn"
                    aria-label="Close menu"
                >
                    <X style={{ width: 20, height: 20 }} />
                </button>

                {/* Brand */}
                <div className="sidebar-brand">
                    <div className="sidebar-brand-icon">
                        <Sparkles style={{ width: 20, height: 20, color: 'white' }} />
                    </div>
                    <span className="sidebar-brand-name">Refactor AI</span>
                </div>

                {/* Section label */}
                <div className="sidebar-section-label">MENU</div>

                {/* Navigation links */}
                <nav className="sidebar-nav">
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setMobileOpen(false)}
                            className={`sidebar-link ${isActive(path) ? 'sidebar-link--active' : ''}`}
                        >
                            <div className="sidebar-link-icon">
                                <Icon style={{ width: 18, height: 18 }} />
                            </div>
                            <span className="sidebar-link-label">{label}</span>
                            {isActive(path) && (
                                <ChevronRight style={{ width: 16, height: 16, marginLeft: 'auto', opacity: 0.5 }} />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Bottom section */}
                <div className="sidebar-bottom">
                    <button
                        onClick={() => {
                            setMobileOpen(false)
                            logout()
                        }}
                        className="sidebar-logout-btn"
                    >
                        <LogOut style={{ width: 18, height: 18 }} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
