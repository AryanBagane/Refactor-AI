import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    History, Trash2, Clock, TrendingUp, TrendingDown,
    FileText, ChevronDown, ChevronUp, BarChart3, Search,
    Sparkles, Copy, Check
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function HistoryPage() {
    const [scans, setScans] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)
    const [copiedIndex, setCopiedIndex] = useState(null) // tracks {scanId, bulletIdx}
    const navigate = useNavigate()

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const response = await api.get('/scan/history')
            setScans(response.data)
        } catch (error) {
            toast.error('Failed to load scan history')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (scanId) => {
        try {
            await api.delete(`/scan/history/${scanId}`)
            setScans((prev) => prev.filter((s) => s.id !== scanId))
            toast.success('Scan record deleted')
        } catch (error) {
            toast.error('Failed to delete scan record')
        }
    }

    const handleViewScore = (scan) => {
        navigate('/match-score', {
            state: {
                result: {
                    match_score: scan.match_score,
                    missing_keywords: scan.missing_keywords,
                    matched_keywords: scan.matched_keywords,
                },
                jobDescription: scan.job_description,
                scanId: scan.id,
            },
        })
    }

    const handleCopyBullet = async (text, scanId, idx) => {
        await navigator.clipboard.writeText(text)
        setCopiedIndex({ scanId, idx })
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const getScoreColor = (score) => {
        if (score < 40) return '#F87171'
        if (score < 70) return '#FBBF24'
        return '#34D399'
    }

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div style={{
            flex: 1, paddingTop: '2rem', paddingLeft: '1.5rem',
            paddingRight: '1.5rem', paddingBottom: '3rem',
            width: '100%', maxWidth: '100%', overflow: 'hidden',
        }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '2.5rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Scan History
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '30rem', margin: '0 auto', lineHeight: 1.6 }}>
                    View your past resume analyses and track improvement over time
                </p>
            </motion.div>

            {/* Summary Stats */}
            {scans.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    style={{
                        display: 'flex', gap: '1rem', justifyContent: 'center',
                        flexWrap: 'wrap', marginBottom: '2rem',
                    }}
                >
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                        background: 'rgba(99, 102, 241, 0.08)',
                        border: '1px solid rgba(99, 102, 241, 0.15)',
                    }}>
                        <History style={{ width: 18, height: 18, color: 'var(--color-primary-light)' }} />
                        <div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                                {scans.length}
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Total Scans</div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                        background: 'rgba(52, 211, 153, 0.08)',
                        border: '1px solid rgba(52, 211, 153, 0.15)',
                    }}>
                        <TrendingUp style={{ width: 18, height: 18, color: 'var(--color-success)' }} />
                        <div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-success)' }}>
                                {Math.round(Math.max(...scans.map(s => s.match_score)))}%
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Best Score</div>
                        </div>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.625rem',
                        padding: '0.75rem 1.25rem', borderRadius: '0.75rem',
                        background: 'rgba(251, 191, 36, 0.08)',
                        border: '1px solid rgba(251, 191, 36, 0.15)',
                    }}>
                        <BarChart3 style={{ width: 18, height: 18, color: '#FBBF24' }} />
                        <div>
                            <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#FBBF24' }}>
                                {Math.round(scans.reduce((sum, s) => sum + s.match_score, 0) / scans.length)}%
                            </div>
                            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Average</div>
                        </div>
                    </div>
                </motion.div>
            )}

            {scans.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass"
                    style={{
                        borderRadius: '1.25rem', padding: '4rem 2rem',
                        textAlign: 'center', maxWidth: '28rem', margin: '0 auto',
                    }}
                >
                    <div style={{
                        width: 72, height: 72, borderRadius: '1.25rem',
                        background: 'rgba(99, 102, 241, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <FileText style={{ width: 36, height: 36, color: 'var(--color-primary-light)' }} />
                    </div>
                    <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
                        No scans yet
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                        Go to the Workspace and analyze a resume to see your history here.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-primary"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <Search style={{ width: 18, height: 18 }} />
                        Go to Workspace
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {scans.map((scan, i) => {
                        const scoreColor = getScoreColor(scan.match_score)
                        const isExpanded = expandedId === scan.id

                        return (
                            <motion.div
                                key={scan.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass"
                                style={{ borderRadius: '1rem', overflow: 'hidden' }}
                            >
                                {/* Main Row */}
                                <div
                                    onClick={() => setExpandedId(isExpanded ? null : scan.id)}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        display: 'flex', alignItems: 'center', gap: '1.25rem',
                                        cursor: 'pointer', transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* Score Badge */}
                                    <div style={{
                                        width: 56, height: 56, borderRadius: '0.875rem',
                                        background: `${scoreColor}14`,
                                        border: `1px solid ${scoreColor}30`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: scoreColor }}>
                                            {Math.round(scan.match_score)}%
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: '0.875rem', fontWeight: 500,
                                            color: 'var(--color-text)',
                                            overflow: 'hidden', textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap', margin: 0, marginBottom: '0.5rem',
                                        }}>
                                            {scan.job_description.substring(0, 90)}...
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                            <span style={{
                                                fontSize: '0.75rem', color: 'var(--color-text-muted)',
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                            }}>
                                                <Clock style={{ width: 14, height: 14 }} />
                                                {formatDate(scan.created_at)}
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem', color: 'var(--color-success)',
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                            }}>
                                                <TrendingUp style={{ width: 14, height: 14 }} />
                                                {scan.matched_keywords.length} matched
                                            </span>
                                            <span style={{
                                                fontSize: '0.75rem', color: 'var(--color-danger)',
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                            }}>
                                                <TrendingDown style={{ width: 14, height: 14 }} />
                                                {scan.missing_keywords.length} missing
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleViewScore(scan)
                                            }}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                padding: '0.4rem 0.75rem', borderRadius: '0.5rem',
                                                fontSize: '0.75rem', fontWeight: 500,
                                                background: 'rgba(99, 102, 241, 0.1)',
                                                color: 'var(--color-primary-light)',
                                                border: '1px solid rgba(99, 102, 241, 0.2)',
                                                cursor: 'pointer', transition: 'all 0.2s ease',
                                                whiteSpace: 'nowrap',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'
                                            }}
                                            title="View detailed match score"
                                        >
                                            <BarChart3 style={{ width: 14, height: 14 }} />
                                            View Score
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleDelete(scan.id)
                                            }}
                                            style={{
                                                width: 34, height: 34, borderRadius: '0.5rem',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: 'none', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                                            }}
                                            title="Delete scan"
                                        >
                                            <Trash2 style={{ width: 15, height: 15, color: 'var(--color-text-muted)' }} />
                                        </button>
                                        {isExpanded ? (
                                            <ChevronUp style={{ width: 18, height: 18, color: 'var(--color-text-muted)' }} />
                                        ) : (
                                            <ChevronDown style={{ width: 18, height: 18, color: 'var(--color-text-muted)' }} />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                padding: '1.25rem 1.5rem',
                                                borderTop: '1px solid var(--color-border)',
                                            }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                    {/* Missing Keywords */}
                                                    <div>
                                                        <h4 style={{
                                                            fontSize: '0.75rem', fontWeight: 600,
                                                            color: 'var(--color-danger)',
                                                            marginBottom: '0.75rem',
                                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        }}>
                                                            <TrendingDown style={{ width: 14, height: 14 }} />
                                                            Missing Keywords ({scan.missing_keywords.length})
                                                        </h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                            {scan.missing_keywords.map((kw) => (
                                                                <span
                                                                    key={kw}
                                                                    style={{
                                                                        padding: '0.25rem 0.625rem',
                                                                        borderRadius: '9999px',
                                                                        fontSize: '0.6875rem', fontWeight: 500,
                                                                        background: 'rgba(248, 113, 113, 0.1)',
                                                                        color: 'var(--color-danger)',
                                                                        border: '1px solid rgba(248, 113, 113, 0.2)',
                                                                    }}
                                                                >
                                                                    {kw}
                                                                </span>
                                                            ))}
                                                            {scan.missing_keywords.length === 0 && (
                                                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                                    None — great job!
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Matched Keywords */}
                                                    <div>
                                                        <h4 style={{
                                                            fontSize: '0.75rem', fontWeight: 600,
                                                            color: 'var(--color-success)',
                                                            marginBottom: '0.75rem',
                                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        }}>
                                                            <TrendingUp style={{ width: 14, height: 14 }} />
                                                            Matched Keywords ({scan.matched_keywords.length})
                                                        </h4>
                                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                                            {scan.matched_keywords.map((kw) => (
                                                                <span
                                                                    key={kw}
                                                                    style={{
                                                                        padding: '0.25rem 0.625rem',
                                                                        borderRadius: '9999px',
                                                                        fontSize: '0.6875rem', fontWeight: 500,
                                                                        background: 'rgba(52, 211, 153, 0.1)',
                                                                        color: 'var(--color-success)',
                                                                        border: '1px solid rgba(52, 211, 153, 0.2)',
                                                                    }}
                                                                >
                                                                    {kw}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* AI Rewrites */}
                                                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-border)' }}>
                                                    <h4 style={{
                                                        fontSize: '0.75rem', fontWeight: 600,
                                                        color: 'var(--color-primary-light)',
                                                        marginBottom: '0.75rem',
                                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                    }}>
                                                        <Sparkles style={{ width: 14, height: 14 }} />
                                                        AI Rewrites ({scan.ai_rewrites?.length || 0})
                                                    </h4>
                                                    {scan.ai_rewrites && scan.ai_rewrites.length > 0 ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                                                            {scan.ai_rewrites.map((bullet, idx) => {
                                                                const isCopied = copiedIndex?.scanId === scan.id && copiedIndex?.idx === idx
                                                                return (
                                                                    <div key={idx} style={{
                                                                        display: 'flex', alignItems: 'flex-start',
                                                                        gap: '0.75rem', padding: '0.75rem 1rem',
                                                                        borderRadius: '0.625rem',
                                                                        background: 'rgba(99, 102, 241, 0.04)',
                                                                        border: '1px solid rgba(99, 102, 241, 0.12)',
                                                                    }}>
                                                                        <p style={{
                                                                            flex: 1, fontSize: '0.8125rem',
                                                                            color: 'var(--color-text)', lineHeight: 1.6,
                                                                            margin: 0,
                                                                        }}>
                                                                            {bullet}
                                                                        </p>
                                                                        <button
                                                                            onClick={() => handleCopyBullet(bullet, scan.id, idx)}
                                                                            title="Copy to clipboard"
                                                                            style={{
                                                                                flexShrink: 0, display: 'flex', alignItems: 'center',
                                                                                gap: '0.3rem', padding: '0.3rem 0.6rem',
                                                                                borderRadius: '0.4rem', border: 'none',
                                                                                cursor: 'pointer', fontSize: '0.6875rem', fontWeight: 600,
                                                                                transition: 'all 0.2s ease',
                                                                                background: isCopied ? 'rgba(52,211,153,0.15)' : 'rgba(99,102,241,0.1)',
                                                                                color: isCopied ? 'var(--color-success)' : 'var(--color-primary-light)',
                                                                            }}
                                                                        >
                                                                            {isCopied
                                                                                ? <><Check style={{ width: 12, height: 12 }} /> Copied!</>
                                                                                : <><Copy style={{ width: 12, height: 12 }} /> Copy</>}
                                                                        </button>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                                            No AI rewrites saved. Click <strong>View Score</strong> and generate rewrites to save them here.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
