import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, Mail, Lock, ArrowRight, Zap, Target, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login, loading } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const result = await login(email, password)
        if (result.success) {
            toast.success('Welcome back!')
            navigate('/')
        } else {
            toast.error(result.message)
        }
    }

    return (
        <div className="auth-layout relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-3xl" />
            </div>

            {/* Hero panel — desktop only */}
            <div className="auth-hero">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <div className="auth-brand mb-6">
                        <img src="/refactorai_logo.png" alt="Refactor AI Logo" className="w-8 h-8 object-contain" />
                        <span className="auth-brand-name">Refactor AI</span>
                    </div>
                    <h2 className="auth-hero-tagline">
                        Craft Resumes That Get You Hired
                    </h2>
                    <p className="auth-hero-sub">
                        Stop guessing what recruiters want. Let AI tailor your resume to every job description — instantly.
                    </p>
                    <ul className="auth-feature-list">
                        <li>
                            <span className="auth-feature-icon">
                                <Target className="w-5 h-5" />
                            </span>
                            AI-powered keyword matching against job descriptions
                        </li>
                        <li>
                            <span className="auth-feature-icon">
                                <Zap className="w-5 h-5" />
                            </span>
                            Smart bullet-point rewrites tailored to each role
                        </li>
                        <li>
                            <span className="auth-feature-icon">
                                <BarChart3 className="w-5 h-5" />
                            </span>
                            Real-time match scoring to track your fit
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* Form side */}
            <div className="auth-form-side relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-md"
                >
                    {/* Logo header */}
                    <div className="text-center mb-8">
                        <div className="auth-brand justify-center mb-4">
                            <img src="/refactorai_logo.png" alt="Refactor AI Logo" className="w-8 h-8 object-contain" />
                            <span className="auth-brand-name">Refactor AI</span>
                        </div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">Welcome Back, Achiever</h1>
                        <p className="text-[var(--color-text-muted)]">
                            Your dream job is one smart resume away
                        </p>
                    </div>

                    {/* Form card */}
                    <div className="glass-strong rounded-2xl" style={{ padding: '1.25rem' }}>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    Email Address
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--color-text-muted)' }} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field"
                                        style={{ paddingLeft: '3rem' }}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--color-text-muted)' }} />
                                    <input
                                        id="login-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="input-field"
                                        style={{ paddingLeft: '3rem' }}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                <div style={{ textAlign: 'right' }}>
                                    <Link
                                        to="/forgot-password"
                                        style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)', textDecoration: 'none' }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                                >
                                    {loading ? (
                                        <div style={{ width: '1.25rem', height: '1.25rem', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    ) : (
                                        <>
                                            <LogIn style={{ width: '1.25rem', height: '1.25rem' }} />
                                            Sign In
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                                Don't have an account?{' '}
                                <Link
                                    to="/signup"
                                    style={{ color: 'var(--color-primary-light)', fontWeight: 500, textDecoration: 'none' }}
                                >
                                    Sign Up →
                                </Link>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
