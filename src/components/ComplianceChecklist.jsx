import { useState } from 'react'

const GDPR_RIGHTS = [
  { key: 'right_to_be_informed',      label: 'Right to be informed',          desc: 'Company must clearly explain what data they collect and why' },
  { key: 'right_of_access',           label: 'Right of access',               desc: 'You can ask to see all data they hold about you' },
  { key: 'right_to_rectification',    label: 'Right to rectification',        desc: 'You can ask them to fix incorrect data about you' },
  { key: 'right_to_erasure',          label: 'Right to erasure',              desc: 'You can ask them to delete all your data ("right to be forgotten")' },
  { key: 'right_to_restrict',         label: 'Right to restrict processing',  desc: 'You can say: keep my data but stop using it' },
  { key: 'right_to_portability',      label: 'Right to data portability',     desc: 'You can get your data in a portable format to move elsewhere' },
  { key: 'right_to_object',           label: 'Right to object',               desc: 'You can say: stop processing my data for marketing or profiling' },
  { key: 'automated_decision_rights', label: 'Rights vs automated decisions', desc: 'You can demand human review if an algorithm made a decision about you' },
]

const DPDP_RIGHTS = [
  { key: 'right_to_access',           label: 'Right to access information',   desc: 'You can ask what data they have on you and how it is used' },
  { key: 'right_to_correction',       label: 'Right to correction',           desc: 'You can ask them to fix wrong or incomplete data about you' },
  { key: 'right_to_erasure',          label: 'Right to erasure',              desc: 'You can ask them to delete your data when no longer needed' },
  { key: 'right_to_grievance',        label: 'Right to grievance redressal',  desc: 'Company must have a process to handle your complaints' },
  { key: 'right_to_nominate',         label: 'Right to nominate',             desc: 'You can nominate someone to exercise your rights on your behalf' },
  { key: 'right_to_withdraw_consent', label: 'Right to withdraw consent',     desc: 'You can take back permission you gave them, at any time' },
  { key: 'childrens_data_protection', label: "Children's data protection",    desc: 'Parental consent required for users under 18' },
]

const STATUS_CONFIG = {
  found:   { icon: '✅', bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  badge: 'bg-green-100 text-green-700',  label: 'Found'   },
  vague:   { icon: '⚠️', bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700',  label: 'Vague'   },
  missing: { icon: '❌', bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700',      label: 'Missing' },
}

function calcScore(rights, data) {
  if (!data) return 0
  let points = 0
  rights.forEach(r => {
    const s = data[r.key]?.status
    if (s === 'found')   points += 1
    if (s === 'vague')   points += 0.5
  })
  return Math.round((points / rights.length) * 100)
}

function RightRow({ right, data }) {
  const entry = data?.[right.key]
  const status = entry?.status || 'missing'
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.missing

  return (
    <div className={`rounded-xl border p-3 ${c.bg} ${c.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5">{c.icon}</span>
          <div>
            <p className="text-sm font-medium text-slate-800">{right.label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{right.desc}</p>
            {entry?.note && (
              <p className={`text-xs mt-1 font-medium ${c.text}`}>"{entry.note}"</p>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${c.badge}`}>
          {c.label}
        </span>
      </div>
    </div>
  )
}

function ScorePill({ score }) {
  const color = score >= 75 ? 'bg-green-100 text-green-700' : score >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
  return (
    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${color}`}>
      {score}% compliant
    </span>
  )
}

export default function ComplianceChecklist({ data }) {
  const [activeTab, setActiveTab] = useState('dpdp')

  const gdprScore = calcScore(GDPR_RIGHTS, data?.gdpr)
  const dpdpScore = calcScore(DPDP_RIGHTS, data?.dpdp)

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium text-slate-700">Compliance overview</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">DPDP Act 2023 (India)</p>
            <ScorePill score={dpdpScore} />
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-200">
            <p className="text-xs text-slate-500 mb-1">GDPR (European Union)</p>
            <ScorePill score={gdprScore} />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('dpdp')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeTab === 'dpdp' ? 'tab-active' : 'tab-inactive'}`}
        >
          ⚖️ DPDP — India
        </button>
        <button
          onClick={() => setActiveTab('gdpr')}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${activeTab === 'gdpr' ? 'tab-active' : 'tab-inactive'}`}
        >
          🇪🇺 GDPR — EU
        </button>
      </div>

      {activeTab === 'dpdp' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 px-1">Digital Personal Data Protection Act, 2023 — India</p>
          {DPDP_RIGHTS.map(r => <RightRow key={r.key} right={r} data={data?.dpdp} />)}
        </div>
      )}

      {activeTab === 'gdpr' && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400 px-1">General Data Protection Regulation, 2018 — European Union</p>
          {GDPR_RIGHTS.map(r => <RightRow key={r.key} right={r} data={data?.gdpr} />)}
        </div>
      )}
    </div>
  )
}
