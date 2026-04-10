import { useState } from 'react'

const TYPE_CONFIG = {
  privacy: { bg: 'bg-purple-50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', label: 'Privacy' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', label: 'Warning' },
  rights:  { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-700',  dot: 'bg-green-500',  label: 'Your rights' },
  billing: { bg: 'bg-blue-50',   border: 'border-blue-200',   badge: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-500',   label: 'Billing' },
  risk:    { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-700',    dot: 'bg-red-500',    label: '🚩 Red flag' },
}

const DEFAULT = TYPE_CONFIG.warning

export default function SummaryCard({ section }) {
  const [showOriginal, setShowOriginal] = useState(false)
  const c = TYPE_CONFIG[section.type] || DEFAULT

  return (
    <div className={`rounded-2xl border p-5 transition-all ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${c.dot}`} />
          <h3 className="font-medium text-slate-800 text-sm">{section.title}</h3>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
          {c.label}
        </span>
      </div>

      <ul className="space-y-1.5 mb-3">
        {section.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="text-slate-400 mt-0.5 flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {section.original_clause && (
        <div>
          <button
            onClick={() => setShowOriginal(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-medium"
          >
            <span className={`transition-transform duration-200 ${showOriginal ? 'rotate-90' : ''}`}>▶</span>
            {showOriginal ? 'Hide' : 'Show'} original legal text
          </button>

          {showOriginal && (
            <div className="toggle-enter mt-2 p-3 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Original clause</p>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                "{section.original_clause}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
