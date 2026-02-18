import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { KeyRound, Mail, Lock, Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
    const [step, setStep] = useState(1) // 1 = email check, 2 = reset password
    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[var(--color-warning)]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md relative"
            >
                {/* Logo header */}
                <div className="text-center mb-8">
                    <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] items-center justify-center mb-4 shadow-lg shadow-[var(--color-primary)]/25">
                        {step === 1 ? (
                            <KeyRound className="w-8 h-8 text-white" />
                        ) : (
                            <ShieldCheck className="w-8 h-8 text-white" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold gradient-text mb-2">
                        {step === 1 ? 'Forgot Password' : 'Reset Password'}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {step === 1
                            ? 'Enter your email to verify your account'
                            : 'Create your new password'}
                    </p>
                </div>

                {/* Steps indicator */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <div className={`w-8 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-lighter)]'}`} />
                    <div className={`w-8 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-lighter)]'}`} />
                </div>

                {/* Form card */}
                <div className="glass-strong rounded-2xl p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleEmailCheck}
                                className="space-y-5"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field pl-11"
                                            placeholder="you@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
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
                                className="space-y-5"
                            >
                                <div className="text-center p-3 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20">
                                    <p className="text-sm text-[var(--color-primary-light)]">
                                        Verified: <span className="font-medium">{email}</span>
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                        <input
                                            id="reset-new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input-field pl-11"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
                                        <input
                                            id="reset-confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-field pl-11"
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-5 h-5" />
                                            Reset Password
                                        </>
                                    )}
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm transition-colors no-underline inline-flex items-center gap-1"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
