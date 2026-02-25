import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { KeyRound, Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, Zap, Target, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1) // 1 = email check, 2 = reset password
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const { forgotPassword, resetPassword } = useAuth()
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleEmailCheck = async (e) => {
        e.preventDefault()
        setLoading(true)
        const result = await forgotPassword(email)
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            setStep(2)
        } else {
            toast.error(result.message)
        }
    }

    const handleReset = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        const result = await resetPassword(email, newPassword)
        setLoading(false)

        if (result.success) {
            toast.success(result.message)
            navigate('/login')
        } else {
            toast.error(result.message)
        }
    }

    const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }
    const iconStyle = { position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1.25rem', height: '1.25rem', color: 'var(--color-text-muted)' }
    const inputStyle = { paddingLeft: '3rem' }

    return (
        <div className="auth-layout relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--color-warning)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
            </div>

            {/* Hero panel — desktop only */}
            <div className="auth-hero">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                    <div className="auth-brand" style={{ marginBottom: '1.5rem' }}>
                        <img src="/refactorai_logo.png" alt="Refactor AI Logo" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
                        <span className="auth-brand-name">Refactor AI</span>
                    </div>
                    <h2 className="auth-hero-tagline">
                        {step === 1 ? 'No Worries, We Got You' : 'Almost There!'}
                    </h2>
                    <p className="auth-hero-sub">
                        {step === 1
                            ? 'It happens to the best of us. Verify your email and you\'ll be back on track in no time.'
                            : 'Set a strong new password and get back to crafting resumes that land interviews.'}
                    </p>
                    <ul className="auth-feature-list">
                        <li>
                            <span className="auth-feature-icon">
                                <Target style={{ width: '1.25rem', height: '1.25rem' }} />
                            </span>
                            AI-powered keyword matching against job descriptions
                        </li>
                        <li>
                            <span className="auth-feature-icon">
                                <Zap style={{ width: '1.25rem', height: '1.25rem' }} />
                            </span>
                            Smart bullet-point rewrites tailored to each role
                        </li>
                        <li>
                            <span className="auth-feature-icon">
                                <BarChart3 style={{ width: '1.25rem', height: '1.25rem' }} />
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
                    style={{ width: '100%', maxWidth: '28rem' }}
                >
                    {/* Logo header */}
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <div className="auth-brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
                            <img src="/refactorai_logo.png" alt="Refactor AI Logo" style={{ width: '2rem', height: '2rem', objectFit: 'contain' }} />
                            <span className="auth-brand-name">Refactor AI</span>
                        </div>
                        <h1 className="gradient-text" style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                            {step === 1 ? 'Forgot Password' : 'Reset Password'}
                        </h1>
                        <p style={{ color: 'var(--color-text-muted)' }}>
                            {step === 1
                                ? 'Enter your email to verify your account'
                                : 'Create your new password'}
                        </p>
                    </div>

                    {/* Steps indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        <div style={{ width: '2rem', height: '0.25rem', borderRadius: '9999px', background: step >= 1 ? 'var(--color-primary)' : 'var(--color-surface-lighter)', transition: 'background 0.3s' }} />
                        <div style={{ width: '2rem', height: '0.25rem', borderRadius: '9999px', background: step >= 2 ? 'var(--color-primary)' : 'var(--color-surface-lighter)', transition: 'background 0.3s' }} />
                    </div>

                    {/* Form card */}
                    <div className="glass-strong rounded-2xl" style={{ padding: '1.25rem' }}>
                        <AnimatePresence mode="wait">
                            {step === 1 ? (
                                <motion.form
                                    key="step1"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleEmailCheck}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                >
                                    <div>
                                        <label style={labelStyle}>
                                            Email Address
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Mail style={iconStyle} />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="input-field"
                                                style={inputStyle}
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
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
                                                <Mail style={{ width: '1.25rem', height: '1.25rem' }} />
                                                Verify Email
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    onSubmit={handleReset}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                >
                                    <div style={{ textAlign: 'center', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                        <p style={{ fontSize: '0.875rem', color: 'var(--color-primary-light)' }}>
                                            Verified: <span style={{ fontWeight: 500 }}>{email}</span>
                                        </p>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>
                                            New Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={iconStyle} />
                                            <input
                                                id="reset-new-password"
                                                type={showNew ? 'text' : 'password'}
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="input-field"
                                                style={{ ...inputStyle, paddingRight: '3rem' }}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNew(v => !v)}
                                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                                                tabIndex={-1}
                                                aria-label={showNew ? 'Hide password' : 'Show password'}
                                            >
                                                {showNew ? <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} /> : <Eye style={{ width: '1.125rem', height: '1.125rem' }} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label style={labelStyle}>
                                            Confirm Password
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <Lock style={iconStyle} />
                                            <input
                                                id="reset-confirm-password"
                                                type={showConfirm ? 'text' : 'password'}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="input-field"
                                                style={{ ...inputStyle, paddingRight: '3rem' }}
                                                placeholder="••••••••"
                                                required
                                                minLength={6}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirm(v => !v)}
                                                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}
                                                tabIndex={-1}
                                                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                            >
                                                {showConfirm ? <EyeOff style={{ width: '1.125rem', height: '1.125rem' }} /> : <Eye style={{ width: '1.125rem', height: '1.125rem' }} />}
                                            </button>
                                        </div>
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
                                                <ShieldCheck style={{ width: '1.25rem', height: '1.25rem' }} />
                                                Reset Password
                                            </>
                                        )}
                                    </button>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                            <Link
                                to="/login"
                                style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                                <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
