import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Copy, Check, Wand2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RewriteModal({ isOpen, onClose, keyword, jdContext = '' }) {
    const [originalBullet, setOriginalBullet] = useState('')
    const [rewrittenBullet, setRewrittenBullet] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleRewrite = async () => {
        if (!originalBullet.trim()) {
            toast.error('Please enter a resume bullet point')
            return
        }

        setLoading(true)
        setRewrittenBullet('')
        try {
            const response = await api.post('/scan/rewrite', {
                original_bullet: originalBullet,
                keyword,
                jd_context: jdContext,
            })
            setRewrittenBullet(response.data.rewritten_bullet)
            toast.success('Bullet point rewritten!')
        } catch (error) {
            toast.error('Failed to rewrite. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        await navigator.clipboard.writeText(rewrittenBullet)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleClose = () => {
        setOriginalBullet('')
        setRewrittenBullet('')
        setCopied(false)
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5 }}
                        className="glass-strong rounded-2xl p-6 w-full max-w-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-[var(--color-text)]">AI Rewrite</h2>
                                    <p className="text-xs text-[var(--color-text-muted)]">
                                        Incorporating: <span className="text-[var(--color-danger)] font-medium">{keyword}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer border-none"
                            >
                                <X className="w-4 h-4 text-[var(--color-text-muted)]" />
                            </button>
                        </div>

                        {/* Original bullet input */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-2">
                                Your Current Bullet Point
                            </label>
                            <textarea
                                value={originalBullet}
                                onChange={(e) => setOriginalBullet(e.target.value)}
                                className="input-field min-h-[80px] resize-none"
                                placeholder='e.g., "Built backend APIs for the application"'
                            />
                        </div>

                        {/* Rewrite button */}
                        <button
                            onClick={handleRewrite}
                            disabled={loading || !originalBullet.trim()}
                            className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Rewriting...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Rewrite with AI
                                </>
                            )}
                        </button>

                        {/* Rewritten result */}
                        <AnimatePresence>
                            {rewrittenBullet && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 rounded-xl bg-[var(--color-success)]/5 border border-[var(--color-success)]/20">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-sm text-[var(--color-text)] leading-relaxed flex-1">
                                                {rewrittenBullet}
                                            </p>
                                            <button
                                                onClick={handleCopy}
                                                className="shrink-0 w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer border-none"
                                                title="Copy to clipboard"
                                            >
                                                {copied ? (
                                                    <Check className="w-4 h-4 text-[var(--color-success)]" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-[var(--color-text-muted)]" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
