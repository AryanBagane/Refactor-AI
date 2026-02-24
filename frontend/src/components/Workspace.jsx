import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Upload, FileText, Zap,
    Briefcase, FileUp, Type
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Workspace() {
    const [jobDescription, setJobDescription] = useState('')
    const [resumeText, setResumeText] = useState('')
    const [fileName, setFileName] = useState('')
    const [resumeFile, setResumeFile] = useState(null)
    const [inputMode, setInputMode] = useState('text') // 'text' or 'file'
    const [analyzing, setAnalyzing] = useState(false)

    const navigate = useNavigate()


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

            toast.success(`Analysis complete! Match: ${response.data.match_score}%`)
            navigate('/match-score', {
                state: {
                    result: response.data,
                    jobDescription,
                    scanId: response.data.scan_id,
                },
            })
        } catch (error) {
            const msg = error.response?.data?.detail || 'Analysis failed'
            toast.error(msg)
        } finally {
            setAnalyzing(false)
        }
    }

    
    return (
        <div style={{ flex: 1, paddingTop: '2rem', paddingLeft: '1.25rem', paddingRight: '1.25rem', paddingBottom: '2rem', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '1.75rem' }}
            >
                <h1 className="gradient-text" style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Resume Mirror</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', maxWidth: '28rem', margin: '0 auto', lineHeight: 1.6 }}>
                    Paste a job description and your resume side by side — discover the keyword gap
                </p>
            </motion.div>

            {/* Split-screen panes */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Left Pane — Job Description */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl flex flex-col"
                    style={{ padding: '1.25rem 1.25rem 1.5rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.875rem', minHeight: '2rem' }}>
                        <Briefcase style={{ width: 20, height: 20, color: 'var(--color-primary-light)', flexShrink: 0 }} />
                        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                            Job Description
                        </h2>
                    </div>

                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="input-field"
                        style={{ flex: 1, minHeight: '340px', resize: 'none', fontSize: '0.875rem', lineHeight: 1.7 }}
                        placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Software Engineer with experience in Python, Docker, Kubernetes, and FastAPI..."
                    />
                </motion.div>

                {/* Right Pane — Resume */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl flex flex-col"
                    style={{ padding: '1.25rem 1.25rem 1.5rem', overflow: 'hidden' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.875rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                            <FileText style={{ width: 20, height: 20, color: 'var(--color-accent)', flexShrink: 0 }} />
                            <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-text)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                Your Resume
                            </h2>
                        </div>

                        {/* Toggle between text and file */}
                        <div style={{ display: 'flex', background: 'var(--color-surface)', borderRadius: '0.5rem', padding: '3px', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                            <button
                                onClick={() => setInputMode('text')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.3rem 0.6rem', borderRadius: '0.375rem',
                                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                                    transition: 'all 0.2s ease',
                                    background: inputMode === 'text' ? 'var(--color-primary)' : 'transparent',
                                    color: inputMode === 'text' ? 'white' : 'var(--color-text-muted)',
                                }}
                            >
                                <Type style={{ width: 14, height: 14 }} />
                                Text
                            </button>
                            <button
                                onClick={() => setInputMode('file')}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                                    padding: '0.3rem 0.6rem', borderRadius: '0.375rem',
                                    fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', border: 'none',
                                    transition: 'all 0.2s ease',
                                    background: inputMode === 'file' ? 'var(--color-primary)' : 'transparent',
                                    color: inputMode === 'file' ? 'white' : 'var(--color-text-muted)',
                                }}
                            >
                                <FileUp style={{ width: 14, height: 14 }} />
                                File
                            </button>
                        </div>
                    </div>

                    {inputMode === 'text' ? (
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            className="input-field"
                            style={{ flex: 1, minHeight: '340px', resize: 'none', fontSize: '0.875rem', lineHeight: 1.7 }}
                            placeholder="Paste your resume text here...&#10;&#10;Example:&#10;• Built backend APIs using Django and Flask&#10;• Managed deployments on AWS EC2 instances&#10;• Implemented CI/CD pipelines..."
                        />
                    ) : (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                flex: 1, minHeight: '340px', borderRadius: '0.75rem',
                                border: '2px dashed', transition: 'all 0.2s ease', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
                                borderColor: fileName ? 'rgba(52,211,153,0.3)' : 'var(--color-border)',
                                background: fileName ? 'rgba(52,211,153,0.05)' : 'transparent',
                            }}
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
                style={{ display: 'flex', justifyContent: 'center', marginBottom: '2.5rem', marginTop: '2.5rem' }}
            >
                <button
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="btn-primary px-10 py-4 text-base flex items-center gap-3 animate-pulse-glow"
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

        </div>
    )
}
