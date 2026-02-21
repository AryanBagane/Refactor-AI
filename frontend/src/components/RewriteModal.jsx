import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Copy, Check, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function RewriteModal({ isOpen, onClose, keyword, jdContext = '' }) {
    const [rewrittenBullet, setRewrittenBullet] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    // Auto-generate when modal opens with a keyword
    useEffect(() => {
        if (isOpen && keyword) {
            generateBullet()
        }
    }, [isOpen, keyword])

    const generateBullet = async () => {
        setLoading(true)
        setRewrittenBullet('')
        setCopied(false)
        try {
            const response = await api.post('/scan/rewrite', {
                original_bullet: `Write a strong resume bullet point incorporating the keyword "${keyword}"`,
                keyword,
                jd_context: jdContext,
            })
            console.log('Rewrite response:', response.data)
            if (response.data && response.data.rewritten_bullet) {
                setRewrittenBullet(response.data.rewritten_bullet)
            } else {
                console.error('Unexpected response structure:', response.data)
                setRewrittenBullet('') // ensures falsy if structure is bad
            }
        } catch (error) {
            console.error('Rewrite error:', error)
            toast.error('Failed to generate. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = async () => {
        if (!rewrittenBullet) return
        await navigator.clipboard.writeText(rewrittenBullet)
        setCopied(true)
        toast.success('Copied to clipboard!')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleClose = () => {
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
                    style={{
                        position: 'fixed', inset: 0, zIndex: 50,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '1rem', background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(4px)',
                    }}
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="glass-strong"
                        style={{
                            borderRadius: '1rem', padding: '1.5rem',
                            width: '100%', maxWidth: '28rem',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '1.25rem',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '0.5rem',
                                    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Sparkles style={{ width: 18, height: 18, color: '#fff' }} />
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                                        AI Bullet Point
                                    </h2>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                        Keyword: <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>{keyword}</span>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                style={{
                                    width: 32, height: 32, borderRadius: '0.5rem',
                                    background: 'rgba(255,255,255,0.05)', border: 'none',
                                    cursor: 'pointer', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.15s ease',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            >
                                <X style={{ width: 16, height: 16, color: 'var(--color-text-muted)' }} />
                            </button>
                        </div>

                        {/* Content */}
                        {loading ? (
                            <div style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                gap: '0.75rem', padding: '2rem 1rem',
                            }}>
                                <Loader2
                                    style={{
                                        width: 28, height: 28,
                                        color: 'var(--color-primary-light)',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                />
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                                    Generating bullet point...
                                </p>
                                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            </div>
                        ) : rewrittenBullet ? (
                            <div>
                                {/* Rewritten bullet */}
                                <div style={{
                                    padding: '1rem 1.125rem', borderRadius: '0.75rem',
                                    background: 'rgba(52, 211, 153, 0.06)',
                                    border: '1px solid rgba(52, 211, 153, 0.15)',
                                    marginBottom: '1rem',
                                }}>
                                    <p style={{
                                        fontSize: '0.8125rem', color: 'var(--color-text)',
                                        lineHeight: 1.65, margin: 0,
                                    }}>
                                        {rewrittenBullet}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={handleCopy}
                                        style={{
                                            flex: 1, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.375rem',
                                            padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                            fontSize: '0.8125rem', fontWeight: 500,
                                            background: copied ? 'rgba(52, 211, 153, 0.15)' : 'rgba(99, 102, 241, 0.1)',
                                            color: copied ? 'var(--color-success)' : 'var(--color-primary-light)',
                                            border: `1px solid ${copied ? 'rgba(52, 211, 153, 0.25)' : 'rgba(99, 102, 241, 0.2)'}`,
                                            cursor: 'pointer', transition: 'all 0.2s ease',
                                        }}
                                    >
                                        {copied ? (
                                            <><Check style={{ width: 14, height: 14 }} /> Copied!</>
                                        ) : (
                                            <><Copy style={{ width: 14, height: 14 }} /> Copy to Clipboard</>
                                        )}
                                    </button>
                                    <button
                                        onClick={generateBullet}
                                        style={{
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.375rem',
                                            padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                            fontSize: '0.8125rem', fontWeight: 500,
                                            background: 'rgba(255,255,255,0.05)',
                                            color: 'var(--color-text-muted)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            cursor: 'pointer', transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        <Sparkles style={{ width: 14, height: 14 }} />
                                        Regenerate
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{
                                padding: '2rem 1rem', textAlign: 'center',
                                color: 'var(--color-text-muted)', fontSize: '0.8125rem',
                            }}>
                                <p style={{ margin: '0 0 1rem 0' }}>Something went wrong. The AI didn't return a result.</p>
                                <button
                                    onClick={generateBullet}
                                    className="btn-primary"
                                    style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
