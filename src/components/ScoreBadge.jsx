import { useState } from 'react'

export default function ScoreBadge({ score, verdict, breakdown = [] }) {
  const [showBreakdown, setShowBreakdown] = useState(false)

  const getColor = () => {
    if (score <= 3) return { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    bar: 'bg-red-500',    label: 'Dangerous',      emoji: '🔴' }
    if (score <= 6) return { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  bar: 'bg-amber-500',  label: 'Mixed concerns', emoji: '🟡' }
    return             { bg: 'bg-green-50',   border: 'border-green-200',  text: 'text-green-700',  bar: 'bg-green-500',  label: 'Mostly fair',    emoji: '🟢' }
  }

  const c = getColor()
  const pct = Math.round((score / 10) * 100)
  const deductions = breakdown.filter(b => b.weight < 0)
  const bonuses    = breakdown.filter(b => b.weight > 0)

  return (
    <div className={`rounded-2xl border ${c.bg} ${c.border}`}>
      <div className="flex items-center gap-4 p-4">
        <div className="flex flex-col items-center min-w-16">
          <span className={`text-3xl font-semibold ${c.text}`}>{score}</span>
          <span className={`text-xs font-medium ${c.text}`}>out of 10</span>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className={`text-sm font-medium ${c.text}`}>
              {c.emoji} Trust score — {c.label}
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-2 border border-slate-200">
            <div className={`h-2 rounded-full transition-all duration-700 ${c.bar}`} style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Dangerous</span>
            <span>Trustworthy</span>
          </div>
        </div>

        {breakdown.length > 0 && (
          <button
            onClick={() => setShowBreakdown(v => !v)}
            className="text-xs text-slate-500 hover:text-indigo-600 font-medium whitespace-nowrap transition-colors"
          >
            {showBreakdown ? 'Hide why ▲' : 'Why? ▼'}
          </button>
        )}
      </div>

      {showBreakdown && breakdown.length > 0 && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-3 space-y-1.5">
          <p className="text-xs font-medium text-slate-500 mb-2">Score breakdown — started at 10</p>
          {deductions.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{b.label}</span>
              <span className="text-red-600 font-medium">{b.weight}</span>
            </div>
          ))}
          {bonuses.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{b.label}</span>
              <span className="text-green-600 font-medium">+{b.weight}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-xs font-medium border-t border-slate-200 pt-1.5 mt-1.5">
            <span className="text-slate-700">Final score</span>
            <span className={c.text}>{score} / 10</span>
          </div>
        </div>
      )}
    </div>
  )
}
