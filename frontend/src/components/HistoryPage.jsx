import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, Trash2, Clock, TrendingUp, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function HistoryPage() {
    const [scans, setScans] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)

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

    const getScoreColor = (score) => {
        if (score < 40) return 'text-[var(--color-danger)]'
        if (score < 70) return 'text-[var(--color-warning)]'
        return 'text-[var(--color-success)]'
    }

    const getScoreBg = (score) => {
        if (score < 40) return 'bg-[var(--color-danger)]/10'
        if (score < 70) return 'bg-[var(--color-warning)]/10'
        return 'bg-[var(--color-success)]/10'
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
            <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex-1 p-6 md:p-8 lg:p-10 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <div className="flex items-center gap-3 mb-2">
                    <History className="w-7 h-7 text-[var(--color-primary-light)]" />
                    <h1 className="text-2xl lg:text-3xl font-bold gradient-text">Scan History</h1>
                </div>
                <p className="text-[var(--color-text-muted)] text-sm">
                    View your past resume analyses and track improvement over time
                </p>
            </motion.div>

            {scans.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="glass rounded-2xl p-12 text-center"
                >
                    <FileText className="w-16 h-16 text-[var(--color-text-muted)]/30 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                        No scans yet
                    </h2>
                    <p className="text-[var(--color-text-muted)] text-sm">
                        Go to the Workspace and analyze a resume to see your history here.
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {scans.map((scan, i) => (
                        <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="glass rounded-2xl overflow-hidden"
                        >
                            {/* Main row */}
                            <div
                                className="p-6 flex items-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                                onClick={() => setExpandedId(expandedId === scan.id ? null : scan.id)}
                            >
                                {/* Score badge */}
                                <div className={`w-14 h-14 rounded-xl ${getScoreBg(scan.match_score)} flex items-center justify-center shrink-0`}>
                                    <span className={`text-lg font-bold ${getScoreColor(scan.match_score)}`}>
                                        {Math.round(scan.match_score)}%
                                    </span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--color-text)] truncate">
                                        {scan.job_description.substring(0, 100)}...
                                    </p>
                                    <div className="flex items-center gap-4 mt-1.5">
                                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                            <Clock className="w-3.5 h-3.5" />
                                            {formatDate(scan.created_at)}
                                        </span>
                                        <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                            {scan.matched_keywords.length} matched, {scan.missing_keywords.length} missing
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleDelete(scan.id)
                                        }}
                                        className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[var(--color-danger)]/10 flex items-center justify-center transition-colors cursor-pointer border-none"
                                        title="Delete scan"
                                    >
                                        <Trash2 className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" />
                                    </button>
                                    {expandedId === scan.id ? (
                                        <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                                    )}
                                </div>
                            </div>

                            {/* Expanded details */}
                            <AnimatePresence>
                                {expandedId === scan.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-5 pb-5 border-t border-[var(--color-border)]">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                                {/* Missing keywords */}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-[var(--color-danger)] mb-2">
                                                        Missing Keywords
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {scan.missing_keywords.map((kw) => (
                                                            <span
                                                                key={kw}
                                                                className="px-2 py-1 rounded-md text-xs bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20"
                                                            >
                                                                {kw}
                                                            </span>
                                                        ))}
                                                        {scan.missing_keywords.length === 0 && (
                                                            <span className="text-xs text-[var(--color-text-muted)]">None — great job!</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Matched keywords */}
                                                <div>
                                                    <h4 className="text-xs font-semibold text-[var(--color-success)] mb-2">
                                                        Matched Keywords
                                                    </h4>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {scan.matched_keywords.map((kw) => (
                                                            <span
                                                                key={kw}
                                                                className="px-2 py-1 rounded-md text-xs bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
                                                            >
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}
