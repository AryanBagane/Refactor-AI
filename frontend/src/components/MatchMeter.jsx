import { motion } from 'framer-motion'

export default function MatchMeter({ score = 0, size = 'normal' }) {
    const isCompact = size === 'compact'
    const radius = isCompact ? 50 : 70
    const viewBox = isCompact ? '0 0 120 120' : '0 0 160 160'
    const center = isCompact ? 60 : 80
    const strokeW = isCompact ? 8 : 10
    const containerClass = isCompact ? 'w-28 h-28' : 'w-36 h-36'
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (score / 100) * circumference

    // Color transitions: red (0-40) → yellow (40-70) → green (70-100)
    const getColor = (score) => {
        if (score < 40) return '#F87171'
        if (score < 70) return '#FBBF24'
        return '#34D399'
    }

    const getLabel = (score) => {
        if (score < 30) return 'Poor Match'
        if (score < 50) return 'Needs Work'
        if (score < 70) return 'Good Start'
        if (score < 85) return 'Strong Match'
        return 'Excellent!'
    }

    const color = getColor(score)

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`relative ${containerClass}`}>
                <svg className="w-full h-full -rotate-90" viewBox={viewBox}>
                    {/* Background circle */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke="var(--color-surface-lighter)"
                        strokeWidth={strokeW}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={center}
                        cy={center}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeW}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeInOut' }}
                        style={{
                            filter: `drop-shadow(0 0 6px ${color}60)`,
                        }}
                    />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        className={`${isCompact ? 'text-2xl' : 'text-3xl'} font-bold`}
                        style={{ color }}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {Math.round(score)}%
                    </motion.span>
                    <span className="text-[0.625rem] text-[var(--color-text-muted)] mt-0.5">Match Score</span>
                </div>
            </div>
            <motion.p
                className="text-xs font-medium"
                style={{ color }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
            >
                {getLabel(score)}
            </motion.p>
        </div>
    )
}
