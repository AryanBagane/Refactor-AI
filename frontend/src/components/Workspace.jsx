import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileText, Search, Zap, AlertCircle,
    Briefcase, FileUp, Type, ChevronDown
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import MatchMeter from './MatchMeter'
import KeywordChips from './KeywordChips'
import RewriteModal from './RewriteModal'

export default function Workspace() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [fileName, setFileName] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [inputMode, setInputMode] = useState('text') // 'text' or 'file'
    const [analyzing, setAnalyzing] = useState(false)
    const [result, setResult] = useState(null)

    // Rewrite modal state
    const [rewriteOpen, setRewriteOpen] = useState(false)
    const [selectedKeyword, setSelectedKeyword] = useState('')

    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const ext = file.name.split('.').pop().toLowerCase()
        if (!['pdf', 'docx'].includes(ext)) {
            toast.error('Please upload a PDF or DOCX file')
            return
        }

        setResumeFile(file)
        setFileName(file.name)
        toast.success(`File loaded: ${file.name}`)
    }

    const handleAnalyze = async () => {
        if (!jobDescription.trim()) {
            toast.error('Please enter a job description')
            return
        }

        if (inputMode === 'text' && !resumeText.trim()) {
            toast.error('Please enter your resume text')
            return
        }

        if (inputMode === 'file' && !resumeFile) {
            toast.error('Please upload a resume file')
            return
        }

        setAnalyzing(true)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('job_description', jobDescription)

            if (inputMode === 'file' && resumeFile) {
                formData.append('resume_file', resumeFile)
            } else {
                formData.append('resume_text', resumeText)
            }

            const response = await api.post('/scan/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })

            setResult(response.data)
            toast.success(`Analysis complete! Match: ${response.data.match_score}%`)
        } catch (error) {
            const msg = error.response?.data?.detail || 'Analysis failed'
            toast.error(msg)
        } finally {
            setAnalyzing(false)
        }
    }

    const handleMissingClick = (keyword) => {
        setSelectedKeyword(keyword)
        setRewriteOpen(true)
    }

    // Highlighting logic for JD text
    const highlightJD = () => {
        if (!result || !jobDescription) return jobDescription

        const { missing_keywords = [], matched_keywords = [] } = result
        const allKeywords = [...missing_keywords, ...matched_keywords]
        if (allKeywords.length === 0) return jobDescription

        const escaped = allKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi')

        const parts = jobDescription.split(regex)
        return parts.map((part, i) => {
            const lower = part.toLowerCase()
            if (missing_keywords.map((k) => k.toLowerCase()).includes(lower)) {
                return (
                    <span key={i} className="bg-[var(--color-danger)]/20 text-[var(--color-danger)] px-0.5 rounded font-medium">
                        {part}
                    </span>
                )
            }
            if (matched_keywords.map((k) => k.toLowerCase()).includes(lower)) {
                return (
                    <span key={i} className="bg-[var(--color-success)]/20 text-[var(--color-success)] px-0.5 rounded font-medium">
                        {part}
                    </span>
                )
            }
            return part
        })
    }

    return (
        <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-6"
            >
                <h1 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">Resume Mirror</h1>
                <p className="text-[var(--color-text-muted)] text-sm">
                    Paste a job description and your resume side by side — discover the keyword gap
                </p>
            </motion.div>

            {/* Split-screen panes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                {/* Left Pane — Job Description */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-5 flex flex-col"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Briefcase className="w-5 h-5 text-[var(--color-primary-light)]" />
                        <h2 className="text-base font-semibold text-[var(--color-text)]">
                            Job Description
                        </h2>
                    </div>

                    {/* Show highlighted overlay when results exist, otherwise show textarea */}
                    {result ? (
                        <div className="flex-1 min-h-[300px] lg:min-h-[400px] p-3 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap">
                            {highlightJD()}
                        </div>
                    ) : (
                        <textarea
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            className="input-field flex-1 min-h-[300px] lg:min-h-[400px] resize-none text-sm leading-relaxed"
                            placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Software Engineer with experience in Python, Docker, Kubernetes, and FastAPI..."
                        />
                    )}
                </motion.div>

                {/* Right Pane — Resume */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-5 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-[var(--color-accent)]" />
                            <h2 className="text-base font-semibold text-[var(--color-text)]">
                                Your Resume
                            </h2>
                        </div>

                        {/* Toggle between text and file */}
                        <div className="flex bg-[var(--color-surface)] rounded-lg p-0.5 border border-[var(--color-border)]">
                            <button
                                onClick={() => setInputMode('text')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${inputMode === 'text'
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent'
                                    }`}
                            >
                                <Type className="w-3.5 h-3.5" />
                                Text
                            </button>
                            <button
                                onClick={() => setInputMode('file')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer border-none ${inputMode === 'file'
                                        ? 'bg-[var(--color-primary)] text-white'
                                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] bg-transparent'
                                    }`}
                            >
                                <FileUp className="w-3.5 h-3.5" />
                                File
                            </button>
                        </div>
                    </div>

                    {inputMode === 'text' ? (
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="input-field flex-1 min-h-[300px] lg:min-h-[400px] resize-none text-sm leading-relaxed"
                            placeholder="Paste your resume text here...&#10;&#10;Example:&#10;• Built backend APIs using Django and Flask&#10;• Managed deployments on AWS EC2 instances&#10;• Implemented CI/CD pipelines..."
                        />
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`flex-1 min-h-[300px] lg:min-h-[400px] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${fileName
                                    ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/5'
                                    : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-primary)]/5'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.docx"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {fileName ? (
                                <>
                                    <div className="w-14 h-14 rounded-xl bg-[var(--color-success)]/10 flex items-center justify-center">
                                        <FileText className="w-7 h-7 text-[var(--color-success)]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[var(--color-text)]">{fileName}</p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">Click to change file</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                                        <Upload className="w-7 h-7 text-[var(--color-primary-light)]" />
                                    </div>
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-[var(--color-text)]">
                                            Drop your resume here or click to browse
                                        </p>
                                        <p className="text-xs text-[var(--color-text-muted)] mt-1">
                                            Supports PDF and DOCX
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Analyze button */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center mb-8"
            >
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="btn-primary px-8 py-3.5 text-base flex items-center gap-2.5 animate-pulse-glow"
                >
                    {analyzing ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <Zap className="w-5 h-5" />
                            Analyze Match
                        </>
                    )}
                </button>
            </motion.div>

            {/* Results section */}
            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        {/* Match meter + Keywords */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Match Meter */}
                            <div className="glass rounded-2xl p-6 flex items-center justify-center">
                                <MatchMeter score={result.match_score} />
                            </div>

                            {/* Keywords */}
                            <div className="glass rounded-2xl p-6 md:col-span-2">
                                <KeywordChips
                                    missing={result.missing_keywords}
                                    matched={result.matched_keywords}
                                    onMissingClick={handleMissingClick}
                                />
                            </div>
                        </div>

                        {/* Tip */}
                        <div className="glass rounded-xl p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-[var(--color-primary-light)] shrink-0 mt-0.5" />
                            <p className="text-sm text-[var(--color-text-muted)]">
                                <span className="font-medium text-[var(--color-text)]">Tip:</span> Click on any{' '}
                                <span className="text-[var(--color-danger)] font-medium">missing keyword</span> to get an
                                AI-powered bullet point suggestion. Add the rewritten bullets to your resume
                                and re-analyze to improve your score.
                            </p>
                        </div>

                        {/* New scan button */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    setResult(null)
                                    setJobDescription('')
                                    setResumeText('')
                                    setResumeFile(null)
                                    setFileName('')
                                }}
                                className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer bg-transparent border-none flex items-center gap-1"
                            >
                                <Search className="w-4 h-4" />
                                Start a new scan
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rewrite Modal */}
            <RewriteModal
                isOpen={rewriteOpen}
                onClose={() => setRewriteOpen(false)}
                keyword={selectedKeyword}
                jdContext={jobDescription}
            />
        </div>
    )
}
