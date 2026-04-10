const MODES = [
  { id: 'full',       label: 'Full summary',      icon: '📋', desc: 'Everything in the document' },
  { id: 'privacy',    label: 'Privacy focus',      icon: '🔒', desc: 'Data collection & sharing only' },
  { id: 'rights',     label: 'Your rights',        icon: '✊', desc: 'What you can do & opt out of' },
  { id: 'risks',      label: 'Red flags only',     icon: '🚩', desc: 'Genuinely dangerous clauses only' },
  { id: 'compliance', label: 'GDPR & DPDP check',  icon: '⚖️', desc: 'Indian & EU compliance check' },
]

export default function ModeSelector({ mode, onChange }) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500 mb-3">What do you want to know?</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border text-left transition-all ${
              mode === m.id
                ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
            }`}
          >
            <span className="text-lg">{m.icon}</span>
            <span className="text-xs font-medium leading-tight">{m.label}</span>
            <span className="text-xs text-slate-400 leading-tight">{m.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
