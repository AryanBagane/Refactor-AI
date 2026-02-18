import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'

export default function KeywordChips({ missing = [], matched = [], onMissingClick }) {
    if (missing.length === 0 && matched.length === 0) return null

    return (
        <div className="space-y-4">
            {/* Missing keywords */}
            {missing.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-[var(--color-danger)] mb-2 flex items-center gap-1.5">
                        <X className="w-4 h-4" />
                        Missing Keywords ({missing.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {missing.map((keyword, i) => (
                            <motion.button
                                key={keyword}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => onMissingClick?.(keyword)}
                                className="px-3 py-1.5 rounded-full text-xs font-medium
                  bg-[var(--color-danger)]/10 text-[var(--color-danger)] border border-[var(--color-danger)]/20
                  hover:bg-[var(--color-danger)]/20 hover:scale-105 transition-all cursor-pointer"
                                title={`Click to rewrite with "${keyword}"`}
                            >
                                {keyword}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Matched keywords */}
            {matched.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-[var(--color-success)] mb-2 flex items-center gap-1.5">
                        <Check className="w-4 h-4" />
                        Matched Keywords ({matched.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {matched.map((keyword, i) => (
                            <motion.span
                                key={keyword}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                className="px-3 py-1.5 rounded-full text-xs font-medium
                  bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20"
                            >
                                {keyword}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
