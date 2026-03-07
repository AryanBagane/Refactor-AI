import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, AlertCircle, BarChart3, TrendingUp, TrendingDown, Sparkles, Shield, Brain, Layers, Clock, Cpu } from 'lucide-react'
import MatchMeter from './MatchMeter'
import RewriteModal from './RewriteModal'
import { useState } from 'react'

/* ── ATS Breakdown Bar ───────────────────────────────────────────── */
function ATSBar({ label, score, icon: Icon, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
            <div style={{
                width: 30, height: 30, borderRadius: '0.5rem',
                background: `${color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <Icon style={{ width: 15, height: 15, color }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>{label}</span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, color }}>{Math.round(score)}%</span>
                </div>
                <div style={{
                    height: 6, borderRadius: 99, background: 'var(--color-surface-lighter)',
                    overflow: 'hidden',
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(score, 100)}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: delay + 0.2 }}
                        style={{
                            height: '100%', borderRadius: 99,
                            background: `linear-gradient(90deg, ${color}cc, ${color})`,
                            boxShadow: `0 0 8px ${color}40`,
                        }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

/* ── Section Badge ───────────────────────────────────────────────── */
function SectionBadge({ name }) {
    const displayName = name.charAt(0).toUpperCase() + name.slice(1)
    return (
        <span style={{
            padding: '0.2rem 0.625rem', borderRadius: '9999px',
            fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.03em',
            background: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--color-primary-light)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            textTransform: 'capitalize',
        }}>
            {displayName}
        </span>
    )
}

/* ── Main Component ──────────────────────────────────────────────── */
export default function MatchScorePage() {
    const location = useLocation()
    const navigate = useNavigate()
    const result = location.state?.result
    const jobDescription = location.state?.jobDescription || ''
    const scanId = location.state?.scanId || null

    const [rewriteOpen, setRewriteOpen] = useState(false)
    const [selectedKeyword, setSelectedKeyword] = useState('')

    const handleMissingClick = (keyword) => {
        setSelectedKeyword(keyword)
        setRewriteOpen(true)
    }

    const handleBulkRewrite = () => {
        setSelectedKeyword('')
        setRewriteOpen(true)
    }

    // If no result data, show empty state
    if (!result) {
        return (
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '2rem', gap: '1.25rem', minHeight: '70vh',
            }}>
                <div style={{
                    width: 64, height: 64, borderRadius: '1rem',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <BarChart3 style={{ width: 32, height: 32, color: 'var(--color-primary-light)' }} />
                </div>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                    No Analysis Results
                </h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', textAlign: 'center', maxWidth: '22rem', margin: 0 }}>
                    Run an analysis from the Workspace to see your match score here.
                </p>
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}
                >
                    <ArrowLeft style={{ width: 16, height: 16 }} />
                    Go to Workspace
                </button>
            </div>
        )
    }

    const { match_score, missing_keywords = [], matched_keywords = [], ats_breakdown: rawBreakdown, resume_sections = [], experience_years } = result
    const totalKeywords = missing_keywords.length + matched_keywords.length

    // Always build an ATS breakdown — use API data if available, otherwise compute from keywords
    const fallbackKeywordScore = totalKeywords > 0 ? Math.round((matched_keywords.length / totalKeywords) * 100 * 100) / 100 : 0
    const ats_breakdown = (rawBreakdown && typeof rawBreakdown === 'object' && Object.keys(rawBreakdown).length > 0)
        ? rawBreakdown
        : {
            keyword_score: fallbackKeywordScore,
            semantic_score: match_score,
            section_score: resume_sections.length > 0 ? Math.min(resume_sections.length * 20, 100) : 0,
            experience_score: experience_years > 0 ? Math.min(experience_years * 15, 100) : 0,
            skill_depth_score: fallbackKeywordScore * 0.8,
        }

    console.log('ATS result:', { match_score, ats_breakdown: rawBreakdown, resume_sections, experience_years })

    return (
        <div style={{
            flex: 1, paddingTop: '1.5rem', paddingLeft: '1.25rem',
            paddingRight: '1.25rem', paddingBottom: '2rem',
            width: '100%', maxWidth: '100%', overflow: 'hidden',
        }}>
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '1.5rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    ATS Match Score
                </h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem', margin: 0 }}>
                    ATS analysis of your resume
                </p>
            </motion.div>

            {/* Score Card — meter + stats in one compact row */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass"
                style={{
                    borderRadius: '1rem', padding: '1.25rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1.5rem',
                    marginBottom: '1.25rem',
                }}
            >
                {/* Meter */}
                <div style={{ flexShrink: 0 }}>
                    <MatchMeter score={match_score} size="compact" />
                </div>

                {/* Divider */}
                <div style={{
                    width: 1, alignSelf: 'stretch',
                    background: 'var(--color-border)', opacity: 0.5,
                }} />

                {/* Stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(52, 211, 153, 0.08)',
                    }}>
                        <TrendingUp style={{ width: 15, height: 15, color: 'var(--color-success)' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-success)', minWidth: '1.5rem' }}>
                            {matched_keywords.length}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Matched</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(248, 113, 113, 0.08)',
                    }}>
                        <TrendingDown style={{ width: 15, height: 15, color: 'var(--color-danger)' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-danger)', minWidth: '1.5rem' }}>
                            {missing_keywords.length}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Missing</span>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                        background: 'rgba(99, 102, 241, 0.08)',
                    }}>
                        <BarChart3 style={{ width: 15, height: 15, color: 'var(--color-primary-light)' }} />
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary-light)', minWidth: '1.5rem' }}>
                            {totalKeywords}
                        </span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>Total Keywords</span>
                    </div>
                </div>
            </motion.div>

            {/* ATS Breakdown Card */}
            {ats_breakdown && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass"
                    style={{ borderRadius: '1rem', padding: '1.25rem 1.5rem', marginBottom: '1.25rem' }}
                >
                    <h4 style={{
                        fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)',
                        margin: '0 0 1rem 0',
                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                    }}>
                        <Shield style={{ width: 14, height: 14, color: 'var(--color-primary-light)' }} />
                        ATS Score Breakdown
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <ATSBar
                            label="Keyword Match (40%)"
                            score={ats_breakdown.keyword_score || 0}
                            icon={Search}
                            color="#6366f1"
                            delay={0.2}
                        />
                        <ATSBar
                            label="Semantic Similarity (25%)"
                            score={ats_breakdown.semantic_score || 0}
                            icon={Brain}
                            color="#8b5cf6"
                            delay={0.3}
                        />
                        <ATSBar
                            label="Resume Sections (15%)"
                            score={ats_breakdown.section_score || 0}
                            icon={Layers}
                            color="#06b6d4"
                            delay={0.4}
                        />
                        <ATSBar
                            label="Experience Match (10%)"
                            score={ats_breakdown.experience_score || 0}
                            icon={Clock}
                            color="#f59e0b"
                            delay={0.5}
                        />
                        <ATSBar
                            label="Skill Depth (10%)"
                            score={ats_breakdown.skill_depth_score || 0}
                            icon={Cpu}
                            color="#10b981"
                            delay={0.6}
                        />
                    </div>
                </motion.div>
            )}

            {/* Resume Insights — Sections + Experience */}
            {(resume_sections.length > 0 || experience_years > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass"
                    style={{
                        borderRadius: '1rem', padding: '1.25rem 1.5rem',
                        marginBottom: '1.25rem',
                        display: 'grid', gridTemplateColumns: resume_sections.length > 0 && experience_years > 0 ? '1fr auto' : '1fr',
                        gap: '1.25rem', alignItems: 'start',
                    }}
                >
                    {/* Detected Sections */}
                    {resume_sections.length > 0 && (
                        <div>
                            <h4 style={{
                                fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text)',
                                margin: '0 0 0.625rem 0',
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                            }}>
                                <Layers style={{ width: 14, height: 14, color: 'var(--color-primary-light)' }} />
                                Detected Sections
                            </h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                                {resume_sections.map((s) => <SectionBadge key={s} name={s} />)}
                            </div>
                        </div>
                    )}

                    {/* Experience */}
                    {experience_years > 0 && (
                        <div style={{
                            textAlign: 'center', padding: '0.5rem 1rem',
                            borderRadius: '0.75rem',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.15)',
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{experience_years}</div>
                            <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Years Exp</div>
                        </div>
                    )}
                </motion.div>
            )}

            {/* Keywords Section */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="glass"
                style={{
                    borderRadius: '1rem', padding: '1.25rem 1.5rem',
                    marginBottom: '1rem',
                }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    {/* Missing Keywords */}
                    <div>
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            marginBottom: '0.875rem', gap: '1rem'
                        }}>
                            <h4 style={{
                                fontSize: '0.75rem', fontWeight: 600,
                                color: 'var(--color-danger)',
                                margin: 0,
                                display: 'flex', alignItems: 'center', gap: '0.375rem',
                            }}>
                                <TrendingDown style={{ width: 14, height: 14 }} />
                                Missing Keywords ({missing_keywords.length})
                            </h4>

                            {missing_keywords.length > 0 && (
                                <button
                                    onClick={() => setRewriteOpen(true)}
                                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-md text-[12px] tracking-wider transition-all"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                        color: 'white', border: 'none', cursor: 'pointer',
                                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                                    }}
                                >
                                    <Sparkles size={12} />
                                    Combine & Rewrite All
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {missing_keywords.map((kw) => (
                                <span
                                    key={kw}
                                    onClick={() => handleMissingClick(kw)}
                                    style={{
                                        padding: '0.25rem 0.625rem',
                                        borderRadius: '9999px',
                                        fontSize: '0.6875rem', fontWeight: 500,
                                        background: 'rgba(248, 113, 113, 0.1)',
                                        color: 'var(--color-danger)',
                                        border: '1px solid rgba(248, 113, 113, 0.2)',
                                        cursor: 'pointer',
                                        transition: 'background 0.15s ease',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.2)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(248, 113, 113, 0.1)'}
                                >
                                    {kw}
                                </span>
                            ))}
                            {missing_keywords.length === 0 && (
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
                            marginBottom: '0.75rem', marginTop: 0,
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                        }}>
                            <TrendingUp style={{ width: 14, height: 14 }} />
                            Matched Keywords ({matched_keywords.length})
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                            {matched_keywords.map((kw) => (
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
            </motion.div>

            {/* Tip */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass"
                style={{
                    borderRadius: '0.75rem', padding: '0.875rem 1.25rem',
                    display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
                    marginBottom: '1.5rem',
                }}
            >
                <AlertCircle style={{ width: 16, height: 16, color: 'var(--color-primary-light)', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>Tip:</span> Click any{' '}
                    <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>missing keyword</span> for an
                    AI-powered bullet point suggestion or click on "Combine & Rewrite All" to combine and rewrite all the missing keywords in one go.
                </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{ display: 'flex', justifyContent: 'center' }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                >
                    <Search style={{ width: 16, height: 16 }} />
                    New Analysis
                </button>
            </motion.div>

            {/* Rewrite Modal */}
            <RewriteModal
                isOpen={rewriteOpen}
                onClose={() => setRewriteOpen(false)}
                keyword={selectedKeyword}
                keywords={missing_keywords}
                isBulk={!selectedKeyword}
                jdContext={jobDescription}
                scanId={scanId}
            />
        </div>
    )
}
